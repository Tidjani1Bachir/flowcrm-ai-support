import { Resend } from "resend";
import type { LeadData } from "../types/index.ts";

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = new Resend(resendApiKey ?? "missing-resend-api-key");

export async function sendLeadNotification(
  lead: LeadData,
  sessionId: string
): Promise<{ success: boolean }> {
  try {
    const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL;

    if (!resendApiKey || !notificationEmail) {
      return { success: false };
    }

    const companyName = lead.company ?? "Unknown Company";
    const timestamp = new Date().toISOString();
    const subject = `New Lead Captured — ${lead.name} from ${companyName}`;

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin: 0 0 16px; font-size: 20px;">New Lead Captured</h2>
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; max-width: 640px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <tr>
            <th align="left" style="background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 180px;">Name</th>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">${lead.name}</td>
          </tr>
          <tr>
            <th align="left" style="background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">Email</th>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">${lead.email}</td>
          </tr>
          <tr>
            <th align="left" style="background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">Company</th>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">${companyName}</td>
          </tr>
          <tr>
            <th align="left" style="background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">Session ID</th>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">${sessionId}</td>
          </tr>
          <tr>
            <th align="left" style="background: #f8fafc; padding: 12px 16px;">Timestamp</th>
            <td style="padding: 12px 16px;">${timestamp}</td>
          </tr>
        </table>
      </div>
    `;

    await resend.emails.send({
      from: "FlowCRM <onboarding@resend.dev>",
      to: [notificationEmail],
      subject,
      html,
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}