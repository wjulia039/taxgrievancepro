import { Resend } from "resend";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@taxgrievancepro.com";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://taxgrievancepro.com";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "placeholder" || key === "") {
    console.warn("[email] RESEND_API_KEY not configured — emails are no-ops");
    return null;
  }
  return new Resend(key);
}

// ── Lead opt-in confirmation ────────────────────────────────────────────────

export async function sendLeadOptInEmail(
  email: string,
  leadId: string,
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const confirmUrl = `${SITE_URL}/api/leads/confirm?id=${leadId}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Confirm your Tax Grievance Pro notification",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;">
        <h2 style="margin-top:0;">You're almost on the list! ✅</h2>
        <p>
          Thanks for signing up for Tax Grievance Pro alerts. Click the button
          below to confirm your email address so we can notify you when the
          next filing season opens in your county.
        </p>
        <a href="${confirmUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;
                  background:#2ECC71;color:#fff;border-radius:6px;
                  text-decoration:none;font-weight:600;">
          Confirm My Email
        </a>
        <p style="font-size:12px;color:#888;">
          If you didn't request this, you can safely ignore this email.<br/>
          Button not working? Copy this link:<br/>
          <a href="${confirmUrl}" style="color:#2ECC71;">${confirmUrl}</a>
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[email] Failed to send lead opt-in email:", error);
  }
}

// ── Report-ready notification ───────────────────────────────────────────────

export async function sendReportReadyEmail(
  email: string,
  propertyAddress: string,
  reportViewUrl: string,
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Your Tax Grievance Report is ready 📄",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;">
        <h2 style="margin-top:0;">Your report is ready!</h2>
        <p>
          Your Tax Grievance Pro report for
          <strong>${propertyAddress}</strong> has been generated and is ready
          to view.
        </p>
        <a href="${reportViewUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;
                  background:#2ECC71;color:#fff;border-radius:6px;
                  text-decoration:none;font-weight:600;">
          View My Report
        </a>
        <p style="color:#555;font-size:14px;">
          Your report includes a full eligibility analysis, comparable sales
          data, and step-by-step guidance for filing a tax grievance in your
          county.
        </p>
        <p style="font-size:12px;color:#888;">
          Button not working? Copy this link:<br/>
          <a href="${reportViewUrl}" style="color:#2ECC71;">${reportViewUrl}</a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="font-size:11px;color:#aaa;">
          Tax Grievance Pro · This email was sent because you purchased a report.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[email] Failed to send report-ready email:", error);
  }
}
