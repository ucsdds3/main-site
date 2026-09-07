// confirm-event-status — Executive-only status confirm + optional Resend email
//
// Deploy from main-site/:
//   supabase functions deploy confirm-event-status
//
// Secrets:
//   supabase secrets set RESEND_API_KEY=re_...
//   supabase secrets set RESEND_FROM_EMAIL="DS3 Events <onboarding@resend.dev>"
// Optional overrides:
//   supabase secrets set VPI_EMAIL=... VPF_EMAIL=... MARKETING_DIRECTOR_EMAIL=...

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_STATUSES = new Set([
  "none",
  "waiting_room",
  "waiting_finance",
  "waiting_marketing",
  "complete",
]);

const STATUS_LABELS: Record<string, string> = {
  none: "None",
  waiting_room: "Waiting for room booking",
  waiting_finance: "Waiting for finance",
  waiting_marketing: "Waiting for marketing",
  complete: "Complete",
};

function recipientForStatus(status: string): { email: string; role: string } | null {
  const map: Record<string, { emailEnv: string; fallback: string; role: string }> = {
    waiting_room: {
      emailEnv: "VPI_EMAIL",
      fallback: "cclougherty@ucsd.edu",
      role: "VPI",
    },
    waiting_finance: {
      emailEnv: "VPF_EMAIL",
      fallback: "v1zhu@ucsd.edu",
      role: "VPF",
    },
    waiting_marketing: {
      emailEnv: "MARKETING_DIRECTOR_EMAIL",
      fallback: "ankamath@ucsd.edu",
      role: "Director of Marketing",
    },
  };
  const entry = map[status];
  if (!entry) return null;
  return {
    email: Deno.env.get(entry.emailEnv)?.trim() || entry.fallback,
    role: entry.role,
  };
}

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
  // Strip whitespace and accidental wrapping quotes from dashboard/CLI paste.
  return raw.trim().replace(/^['"]|['"]$/g, "");
}

async function sendResendEmail(params: {
  to: string;
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

  const from =
    readSecret("RESEND_FROM_EMAIL") || "DS3 Events <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
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
    if (!member || member.deleted === true || member.admin_level !== "Executive") {
      return json({ error: "Executive access required" }, 403);
    }

    const body = await req.json();
    const eventId = body?.event_id;
    const workflowStatus = body?.workflow_status as string;

    if (eventId == null || !ALLOWED_STATUSES.has(workflowStatus)) {
      return json({ error: "Invalid event_id or workflow_status" }, 400);
    }

    const { data: event, error: eventError } = await admin
      .from("Events")
      .select("id,name,start,end,location,workflow_status,deleted")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError || !event) {
      return json({ error: "Event not found" }, 404);
    }
    if (event.deleted === true) {
      return json({ error: "Event is deleted" }, 400);
    }

    const recipient = recipientForStatus(workflowStatus);
    let emailed = false;

    // Email before DB write so a mail failure does not leave a half-applied notify state.
    if (recipient) {
      const statusLabel = STATUS_LABELS[workflowStatus] ?? workflowStatus;
      const eventName = event.name || `Event #${event.id}`;
      const when = event.start
        ? new Date(event.start).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
        : "TBD";
      const where = event.location || "TBD";
      const subject = `[DS3] ${statusLabel}: ${eventName}`;
      const text = [
        `Hi ${recipient.role},`,
        "",
        `An event needs your attention.`,
        "",
        `Event: ${eventName}`,
        `Status: ${statusLabel}`,
        `Start (PT): ${when}`,
        `Location: ${where}`,
        "",
        `Confirmed by: ${user.email}`,
        "",
        "— DS3 Members Portal",
      ].join("\n");
      const html = `<p>Hi ${recipient.role},</p>
<p>An event needs your attention.</p>
<ul>
  <li><strong>Event:</strong> ${escapeHtml(eventName)}</li>
  <li><strong>Status:</strong> ${escapeHtml(statusLabel)}</li>
  <li><strong>Start (PT):</strong> ${escapeHtml(when)}</li>
  <li><strong>Location:</strong> ${escapeHtml(where)}</li>
</ul>
<p>Confirmed by: ${escapeHtml(user.email ?? "")}</p>
<p>— DS3 Members Portal</p>`;

      await sendResendEmail({ to: recipient.email, subject, html, text });
      emailed = true;
    }

    const { error: updateError } = await admin
      .from("Events")
      .update({ workflow_status: workflowStatus })
      .eq("id", eventId);

    if (updateError) {
      console.error(updateError);
      return json(
        {
          error: emailed
            ? "Email sent but failed to save status — please Confirm again or set status manually."
            : "Failed to update status",
        },
        500
      );
    }

    return json({
      ok: true,
      workflow_status: workflowStatus,
      emailed,
      recipient: recipient?.email ?? null,
    });
  } catch (err) {
    console.error(err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
