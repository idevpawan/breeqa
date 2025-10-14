import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// List pending invitations for an organization (admin/manager)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: organizationId } = await context.params;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission (admin or manager)
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!membership || !["admin", "manager"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { data: invitations, error } = await supabase
      .from("organization_invitations")
      .select(
        `
        *,
        organization:organizations(*),
        inviter:user_profiles!invited_by(*)
      `
      )
      .eq("organization_id", organizationId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading invitations:", error);
      return NextResponse.json(
        { error: "Failed to load invitations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: invitations || [], success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
