import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { InvitationEmail } from "@/components/emails/invitation-email";

export async function GET(request: NextRequest) {
  try {
    // Sample invitation data for preview
    const sampleInvitation = {
      organizationName: "Acme Corporation",
      inviterName: "John Doe",
      role: "developer",
      invitationUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/invite/sample-token-123`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };

    const emailHtml = render(InvitationEmail(sampleInvitation));

    return new NextResponse(emailHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Email preview error:", error);
    return NextResponse.json(
      { error: "Failed to generate email preview" },
      { status: 500 }
    );
  }
}
