import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/types/organization";

// Update a member's role (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const supabase = await createClient();
    const organizationId = params.id;
    const targetUserId = params.userId;
    const body = await request.json();
    const newRole = body?.role as UserRole | undefined;

    if (!newRole) {
      return NextResponse.json(
        { error: "Missing role in request body" },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can change roles
    const { data: requesterMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (requesterMembership?.role !== "admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Update the target member role
    const { data: updatedMember, error } = await supabase
      .from("organization_members")
      .update({ role: newRole })
      .eq("organization_id", organizationId)
      .eq("user_id", targetUserId)
      .select(
        `
        *,
        user:user_profiles!user_id(*)
      `
      )
      .single();

    if (error) {
      console.error("Error updating member role:", error);
      return NextResponse.json(
        { error: "Failed to update member role" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedMember, success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Suspend (remove) a member (admin or manager)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const supabase = await createClient();
    const organizationId = params.id;
    const targetUserId = params.userId;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin and manager can suspend members
    const { data: requesterMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (
      !requesterMembership ||
      !["admin", "manager"].includes(requesterMembership.role)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Mark the member as suspended (do not delete to allow recovery/history)
    const { error } = await supabase
      .from("organization_members")
      .update({ status: "suspended" })
      .eq("organization_id", organizationId)
      .eq("user_id", targetUserId);

    if (error) {
      console.error("Error suspending member:", error);
      return NextResponse.json(
        { error: "Failed to remove member" },
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
