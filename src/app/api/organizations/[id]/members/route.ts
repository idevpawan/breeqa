import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { OrganizationMember } from "@/lib/types/organization";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: organizationId } = await context.params;

    // Get organization members with user details
    const { data: members, error } = await supabase
      .from("organization_members")
      .select(
        `
        *,
        user:user_profiles!user_id(*)
      `
      )
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .order("joined_at", { ascending: false });

    if (error) {
      console.error("Error fetching organization members:", error);
      return NextResponse.json(
        { error: "Failed to fetch organization members" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        members: members as OrganizationMember[],
        total: members?.length || 0,
      },
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
