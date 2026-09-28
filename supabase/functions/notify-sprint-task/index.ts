// notify-sprint-task — email assignees on create, reviewer on pending_review,
// idle board members on nudge, assignees on overdue
//
// Deploy from main-site/:
//   supabase functions deploy notify-sprint-task
//
// Secrets (same as confirm-event-status):
//   RESEND_API_KEY
//   RESEND_FROM_EMAIL
// Optional:
//   MEMBERS_PORTAL_URL  (default https://members.ds3atucsd.com)

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

function uniqueMemberEmails(rows: MemberRow[]): { row: MemberRow; email: string }[] {
  const seen = new Set<string>();
  const out: { row: MemberRow; email: string }[] = [];
  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    if (!email || !email.includes("@") || seen.has(email)) continue;
    seen.add(email);
    out.push({ row, email });
  }
  return out;
}

function uniqueEmails(rows: MemberRow[]): string[] {
  return uniqueMemberEmails(rows).map(item => item.email);
}

function todayYmdPacific(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isOverdueTask(task: {
  expected_completion_on: string | null;
  status: string | null;
}): boolean {
  if (!task.expected_completion_on) return false;
  if (task.status === "done" || task.status === "cancelled") return false;
  return String(task.expected_completion_on).slice(0, 10) < todayYmdPacific();
}

function memberHasTeam(teams: unknown): boolean {
  if (teams == null) return false;
  let value: unknown = teams;
  if (typeof teams === "string") {
    try {
      value = JSON.parse(teams);
    } catch {
      return false;
    }
  }
  if (typeof value !== "object" || value == null || Array.isArray(value)) return false;
  return Object.keys(value as Record<string, unknown>).length > 0;
}

async function idleBoardMembers(
  admin: ReturnType<typeof createClient>,
  sprintId: number
): Promise<MemberRow[]> {
  const { data: links } = await admin
    .from("SprintTaskSprints")
    .select("task_id")
    .eq("sprint_id", sprintId);
  const { data: legacy } = await admin.from("SprintTasks").select("id").eq("sprint_id", sprintId);
  const taskIds = [
    ...new Set([
      ...(links ?? []).map(row => row.task_id as number),
      ...(legacy ?? []).map(row => row.id as number),
    ]),
  ];

  const busy = new Set<number>();
  if (taskIds.length > 0) {
    const { data: taskRows } = await admin.from("SprintTasks").select("id, status").in("id", taskIds);
    const assignedIds = (taskRows ?? [])
      .filter(row => row.status !== "cancelled")
      .map(row => row.id as number);
    if (assignedIds.length > 0) {
      const { data: joins } = await admin
        .from("SprintTaskAssignees")
        .select("member_id")
        .in("task_id", assignedIds);
      for (const join of joins ?? []) busy.add(join.member_id as number);
    }
  }

  const { data: board } = await admin
    .from("Members")
    .select("id, full_name, email, teams")
    .in("admin_level", ["Board", "Executive"])
    .or("deleted.is.null,deleted.eq.false");

  return (board ?? []).filter(row => {
    if (busy.has(row.id as number)) return false;
    if (!memberHasTeam(row.teams)) return false;
    return true;
  }) as MemberRow[];
}

async function handleNudge(
  admin: ReturnType<typeof createClient>,
  body: { sprint_id?: unknown; member_ids?: unknown }
): Promise<Response> {
  const sprintId = Number(body.sprint_id);
  const requested = Array.isArray(body.member_ids)
    ? [...new Set(body.member_ids.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0))]
    : [];
  if (!Number.isInteger(sprintId) || sprintId <= 0 || requested.length === 0) {
    return json({ error: "Invalid sprint_id or member_ids" }, 400);
  }
  if (requested.length > 40) {
    return json({ error: "Too many recipients for one nudge" }, 400);
  }

  const { data: sprint, error: sprintError } = await admin
    .from("Sprints")
    .select("id, name")
    .eq("id", sprintId)
    .maybeSingle();
  if (sprintError || !sprint) {
    return json({ error: "Sprint not found" }, 404);
  }

  const idle = await idleBoardMembers(admin, sprintId);
  const idleById = new Map(idle.map(row => [row.id, row]));
  const targets = requested.map(id => idleById.get(id)).filter((row): row is MemberRow => Boolean(row));
  const recipients = uniqueMemberEmails(targets);
  if (recipients.length === 0) {
    return json({ ok: true, emailed: 0, warning: "No idle members to nudge" });
  }

  const portal = readSecret("MEMBERS_PORTAL_URL") || "https://members.ds3atucsd.com";
  const boardUrl = `${portal.replace(/\/$/, "")}/sprints/${sprintId}`;
  const sprintName = sprint.name || "Current sprint";

  let emailed = 0;
  let failed = 0;
  for (const { row, email } of recipients) {
    const name = row.full_name?.trim() || "there";
    try {
      await sendResendEmail({
        to: [email],
        subject: `[DS3 Sprints] Add your tasks for ${sprintName}`,
        text: [
          `Hi ${name},`,
          "",
          `You don't have any tasks on ${sprintName} yet. Please add your work on the sprint board so the rest of the board can see what you own.`,
          "",
          `Board: ${boardUrl}`,
          "",
          "— DS3 Members Portal",
        ].join("\n"),
        html: `<p>Hi ${escapeHtml(name)},</p>
<p>You don't have any tasks on <strong>${escapeHtml(sprintName)}</strong> yet. Please add your work on the sprint board so the rest of the board can see what you own.</p>
<p><a href="${escapeHtml(boardUrl)}">Open the sprint board</a></p>
<p>— DS3 Members Portal</p>`,
      });
      emailed += 1;
    } catch (err) {
      console.error(err);
      failed += 1;
    }
  }

  if (emailed === 0) {
    return json({ error: "Could not send nudge emails" }, 500);
  }

  return json({ ok: true, emailed, failed, kind: "nudge" });
}

async function handleOverdue(
  admin: ReturnType<typeof createClient>,
  body: { task_id?: unknown }
): Promise<Response> {
  const taskId = Number(body.task_id);
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return json({ error: "Invalid task_id" }, 400);
  }

  const { data: task, error: taskError } = await admin
    .from("SprintTasks")
    .select("id, title, description, team_key, expected_hours, expected_completion_on, status, reviewer_id, sprint_id")
    .eq("id", taskId)
    .maybeSingle();

  if (taskError || !task) {
    return json({ error: "Task not found" }, 404);
  }
  if (!isOverdueTask(task)) {
    return json({ error: "That task is not overdue" }, 400);
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
  const recipients = uniqueMemberEmails(assignees);
  if (recipients.length === 0) {
    return json({ error: "No assignee emails to nudge" }, 400);
  }

  const portal = readSecret("MEMBERS_PORTAL_URL") || "https://members.ds3atucsd.com";
  const boardUrl = `${portal.replace(/\/$/, "")}/sprints/${task.sprint_id}`;
  const sprintName = sprint?.name || "Current sprint";
  const title = task.title || `Task #${task.id}`;
  const due = formatDate(task.expected_completion_on);

  let emailed = 0;
  let failed = 0;
  for (const { row, email } of recipients) {
    const name = row.full_name?.trim() || "there";
    try {
      await sendResendEmail({
        to: [email],
        subject: `[DS3 Sprints] Overdue: ${title}`,
        text: [
          `Hi ${name},`,
          "",
          `This sprint task is past its due date (${due}) and still open on ${sprintName}. Please update it or finish it soon.`,
          "",
          `Task: ${title}`,
          `Board: ${boardUrl}`,
          "",
          "— DS3 Members Portal",
        ].join("\n"),
        html: `<p>Hi ${escapeHtml(name)},</p>
<p>This sprint task is past its due date (<strong>${escapeHtml(due)}</strong>) and still open on <strong>${escapeHtml(sprintName)}</strong>. Please update it or finish it soon.</p>
<p><strong>Task:</strong> ${escapeHtml(title)}</p>
<p><a href="${escapeHtml(boardUrl)}">Open the sprint board</a></p>
<p>— DS3 Members Portal</p>`,
      });
      emailed += 1;
    } catch (err) {
      console.error(err);
      failed += 1;
    }
  }

  if (emailed === 0) {
    return json({ error: "Could not send nudge emails" }, 500);
  }

  return json({ ok: true, emailed, failed, kind: "overdue" });
}

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

    if (kind === "nudge") {
      return await handleNudge(admin, body);
    }
    if (kind === "overdue") {
      return await handleOverdue(admin, body);
    }

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
