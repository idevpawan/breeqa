import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/lib/types/organization";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("Auth check:", { user: !!user, authError, userId: user?.id });

    if (authError || !user) {
      console.log("Authentication failed:", authError);
      return NextResponse.json(
        { error: "Not authenticated", details: authError?.message },
        { status: 401 }
      );
    }

    const { email, role, organizationId } = await request.json();

    // Validate input
    if (!email || !role || !organizationId) {
      return NextResponse.json(
        { error: "Email, role, and organization ID are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = [
      "admin",
      "manager",
      "developer",
      "designer",
      "qa",
      "viewer",
    ];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user has permission to invite users
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Check if user has permission to invite (admin, manager roles)
    const canInvite = ["admin", "manager"].includes(membership.role);
    if (!canInvite) {
      return NextResponse.json(
        { error: "You don't have permission to invite users" },
        { status: 403 }
      );
    }

    // Send invitation directly using server-side Supabase client
    console.log("Sending invitation:", { organizationId, email, role });

    // Check if user is already a member by email
    const { data: isMember } = await supabase.rpc("is_email_member", {
      org_uuid: organizationId,
      email_address: email,
    });

    if (isMember) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from("organization_invitations")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("email", email)
      .eq("status", "pending")
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent to this email" },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data: invitation, error: invitationError } = await supabase
      .from("organization_invitations")
      .insert({
        organization_id: organizationId,
        email,
        role,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select(
        `
        *,
        organization:organizations(*),
        inviter:user_profiles!invited_by(*)
      `
      )
      .single();

    if (invitationError) {
      console.log("Database error:", invitationError);
      return NextResponse.json(
        { error: invitationError.message },
        { status: 500 }
      );
    }

    console.log("Invitation created:", invitation);

    // Send invitation email
    try {
      const { emailService } = await import("@/lib/services/email-service");
      const emailResult = await emailService.sendInvitationEmail(invitation);
      if (!emailResult.success) {
        console.warn("Failed to send invitation email:", emailResult.error);
        // Don't fail the invitation creation if email fails
      }
    } catch (emailError) {
      console.warn("Email service error:", emailError);
      // Don't fail the invitation creation if email fails
    }

    const response = { data: invitation, error: null, success: true };
    console.log("Invitation response:", response);

    if (response.success) {
      return NextResponse.json({
        success: true,
        message: `Invitation sent to ${email}`,
        data: response.data,
      });
    } else {
      console.log("Invitation failed:", response.error);
      return NextResponse.json(
        {
          success: false,
          error: response.error || "Failed to send invitation",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Invite user error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
