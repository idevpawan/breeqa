import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { OrganizationService } from "@/lib/services/organization";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to accept this invitation" },
        { status: 401 }
      );
    }

    // Use service role client for database operations
    const serviceSupabase = createServiceClient();

    // Get invitation details
    const { data: invitation, error: invError } = await serviceSupabase
      .from("organization_invitations")
      .select(
        `
        *,
        organization:organizations(*)
      `
      )
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Add user to organization
    const { data: member, error: memberError } = await serviceSupabase
      .from("organization_members")
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
        status: "active",
        invited_by: invitation.invited_by,
      })
      .select(
        `
        *,
        user:user_profiles!user_id(*),
        organization:organizations(*)
      `
      )
      .single();

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    // Update invitation status
    await serviceSupabase
      .from("organization_invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    return NextResponse.json({
      success: true,
      data: member,
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
