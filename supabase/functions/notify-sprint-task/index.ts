-- notify-sprint-task — email assignees on create, reviewer on pending_review
--
-- Deploy from main-site/:
--   supabase functions deploy notify-sprint-task
--
-- Secrets (same as confirm-event-status):
--   RESEND_API_KEY
--   RESEND_FROM_EMAIL
-- Optional:
--   MEMBERS_PORTAL_URL  (default https://members.ds3atucsd.com)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function readSecret(name: string): string {
  const raw = Deno.env.get(name) ?? "";
  return raw.trim().replace(/^['"]|['"]$/g, "");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function teamLabel(key: string): string {
  return key
    .split("_")
    .map(w => (w ? w.charAt(0) + w.slice(1).toLowerCase() : w))
    .join(" ");
}

function formatDate(iso: string | null): string {
  if (!iso) return "Not set";
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function sendResendEmail(params: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = readSecret("RESEND_API_KEY");
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured on the Edge Function (Supabase → Edge Functions → Secrets)"
    );
  }
  if (!apiKey.startsWith("re_")) {
    throw new Error(
      `RESEND_API_KEY looks wrong (length ${apiKey.length}, should start with re_). Re-set the secret without quotes.`
    );
  }

  const from = readSecret("RESEND_FROM_EMAIL") || "DS3 Sprints <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend failed (${res.status}): ${detail}`);
  }
}

type MemberRow = { id: number; full_name: string | null; email: string | null };

Deno.serve(async req => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return json({ error: "Server misconfigured" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user?.email) {
      return json({ error: "Unauthorized" }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: memberRows, error: memberError } = await admin
      .from("Members")
      .select("admin_level,deleted,email")
      .ilike("email", user.email)
      .limit(1);

    if (memberError) {
      console.error(memberError);
      return json({ error: "Failed to verify membership" }, 500);
    }

    const member = memberRows?.[0];
    const level = member?.admin_level;
    if (
      !member ||
      member.deleted === true ||
      (level !== "Board" && level !== "Executive")
    ) {
      return json({ error: "Board or Executive access required" }, 403);
    }

    const body = await req.json();
    const kind = body?.kind as string;
    const taskId = body?.task_id;
    if (taskId == null || (kind !== "assigned" && kind !== "pending_review")) {
      return json({ error: "Invalid kind or task_id" }, 400);
    }

    const { data: task, error: taskError } = await admin
      .from("SprintTasks")
      .select(
        "id, title, description, team_key, expected_hours, expected_completion_on, status, reviewer_id, sprint_id, relevant_url"
      )
      .eq("id", taskId)
      .maybeSingle();

    if (taskError || !task) {
      return json({ error: "Task not found" }, 404);
    }

    const { data: sprint } = await admin
      .from("Sprints")
      .select("id, name")
      .eq("id", task.sprint_id)
      .maybeSingle();

    const { data: assigneeJoins } = await admin
      .from("SprintTaskAssignees")
      .select("member_id, Members(id, full_name, email)")
      .eq("task_id", taskId);

    const assignees: MemberRow[] = (assigneeJoins ?? []).flatMap(join => {
      const raw = join.Members as MemberRow | MemberRow[] | null;
      if (!raw) return [];
      return Array.isArray(raw) ? raw : [raw];
    });

    let reviewer: MemberRow | null = null;
    if (task.reviewer_id != null) {
      const { data: reviewerRow } = await admin
        .from("Members")
        .select("id, full_name, email")
        .eq("id", task.reviewer_id)
        .maybeSingle();
      reviewer = reviewerRow;
    }

    const portal = readSecret("MEMBERS_PORTAL_URL") || "https://members.ds3atucsd.com";
    const boardUrl = `${portal.replace(/\/$/, "")}/sprints/${task.sprint_id}`;
    const sprintName = sprint?.name || "Current sprint";
    const title = task.title || `Task #${task.id}`;
    const team = teamLabel(String(task.team_key ?? ""));
    const hours = task.expected_hours == null ? "—" : `${task.expected_hours}h`;
    const due = formatDate(task.expected_completion_on);
    const brief = (task.description ?? "").trim() || "No description.";
    const assigneeNames =
      assignees.map(a => a.full_name || a.email || "Unknown").join(", ") || "Unassigned";

    const detailsText = [
      `Task: ${title}`,
      `Sprint: ${sprintName}`,
      `Team: ${team}`,
      `Assignees: ${assigneeNames}`,
      `Reviewer: ${reviewer?.full_name || reviewer?.email || "—"}`,
      `Expected hours: ${hours}`,
      `Due: ${due}`,
      "",
      brief,
      "",
      `Board: ${boardUrl}`,
    ].join("\n");

    const detailsHtml = `<ul>
  <li><strong>Task:</strong> ${escapeHtml(title)}</li>
  <li><strong>Sprint:</strong> ${escapeHtml(sprintName)}</li>
  <li><strong>Team:</strong> ${escapeHtml(team)}</li>
  <li><strong>Assignees:</strong> ${escapeHtml(assigneeNames)}</li>
  <li><strong>Reviewer:</strong> ${escapeHtml(reviewer?.full_name || reviewer?.email || "—")}</li>
  <li><strong>Expected hours:</strong> ${escapeHtml(hours)}</li>
  <li><strong>Due:</strong> ${escapeHtml(due)}</li>
</ul>
<p>${escapeHtml(brief)}</p>
<p><a href="${escapeHtml(boardUrl)}">Open the sprint board</a></p>`;

    const uniqueEmails = (rows: MemberRow[]) => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const row of rows) {
        const email = row.email?.trim().toLowerCase();
        if (!email || !email.includes("@") || seen.has(email)) continue;
        seen.add(email);
        out.push(email);
      }
      return out;
    };

    if (kind === "assigned") {
      const to = uniqueEmails(assignees);
      if (to.length === 0) {
        return json({ ok: true, emailed: 0, warning: "No assignee emails to notify" });
      }
      await sendResendEmail({
        to,
        subject: `[DS3 Sprints] You've been assigned: ${title}`,
        text: [`You've been assigned a sprint task.`, "", detailsText, "", "— DS3 Members Portal"].join(
          "\n"
        ),
        html: `<p>You've been assigned a sprint task.</p>${detailsHtml}<p>— DS3 Members Portal</p>`,
      });
      return json({ ok: true, emailed: to.length, kind });
    }

    if (task.status !== "pending_review") {
      return json({ ok: true, emailed: 0, warning: "Task is not pending review" });
    }

    const to = uniqueEmails(reviewer ? [reviewer] : []);
    if (to.length === 0) {
      return json({ ok: true, emailed: 0, warning: "No reviewer email to notify" });
    }
    await sendResendEmail({
      to,
      subject: `[DS3 Sprints] Ready for your review: ${title}`,
      text: [
        `${assigneeNames} submitted this task for your review.`,
        "",
        detailsText,
        "",
        "— DS3 Members Portal",
      ].join("\n"),
      html: `<p>${escapeHtml(assigneeNames)} submitted this task for your review.</p>${detailsHtml}<p>— DS3 Members Portal</p>`,
    });
    return json({ ok: true, emailed: to.length, kind });
  } catch (err) {
    console.error(err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
