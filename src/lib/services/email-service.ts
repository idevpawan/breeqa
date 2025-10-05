import { Resend } from "resend";
import { render } from "@react-email/render";
import { InvitationEmail } from "@/components/emails/invitation-email";
import { OrganizationInvitation } from "@/lib/types/organization";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend;

  constructor() {
    // if (!process.env.RESEND_API_KEY) {
    //   throw new Error("RESEND_API_KEY environment variable is required");
    // }
    this.resend = new Resend("re_KRv8GSxJ_f6VjZVF4PR86zeRAfncf18Xo");
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendInvitationEmail(
    invitation: OrganizationInvitation
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${invitation.token}`;

      const emailHtml = render(
        InvitationEmail({
          organizationName:
            invitation.organization?.name || "Unknown Organization",
          inviterName:
            invitation.inviter?.full_name ||
            invitation.inviter?.email ||
            "Someone",
          role: invitation.role,
          invitationUrl,
          expiresAt: invitation.expires_at,
        })
      );

      const { data, error } = await this.resend.emails.send({
        from: `${invitation.organization?.name || "Breeqa"} <noreply@${process.env.RESEND_DOMAIN || "handlly.com"}>`,
        to: [invitation.email],
        subject: `You're invited to join ${invitation.organization?.name || "our organization"}`,
        html: await emailHtml,
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      console.log("Email sent successfully:", data);
      return { success: true };
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      };
    }
  }

  async sendTestEmail(
    to: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: `Breeqa <noreply@${process.env.RESEND_DOMAIN || "handlly.com"}>`,
        to: [to],
        subject: "Test Email from Breeqa",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Test Email</h1>
            <p>This is a test email from Breeqa to verify email delivery is working.</p>
            <p>If you received this email, your Resend integration is working correctly!</p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      console.log("Test email sent successfully:", data);
      return { success: true };
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send test email",
      };
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
