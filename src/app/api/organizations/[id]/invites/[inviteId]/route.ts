import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Revoke an invitation (admin/manager)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; inviteId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: organizationId, inviteId } = await context.params;

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

    // Set invitation status to cancelled
    const { error } = await supabase
      .from("organization_invitations")
      .update({ status: "cancelled" })
      .eq("id", inviteId)
      .eq("organization_id", organizationId)
      .eq("status", "pending");

    if (error) {
      console.error("Error revoking invitation:", error);
      return NextResponse.json(
        { error: "Failed to revoke invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: true, success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
