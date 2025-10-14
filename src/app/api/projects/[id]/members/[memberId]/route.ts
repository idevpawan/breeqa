import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: projectId, memberId } = await context.params;

    // Verify user has permission to remove members from this project
    const { data: project } = await supabase
      .from("projects")
      .select("organization_id")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is admin or project lead
    const { data: userMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", project.organization_id)
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .eq("status", "active")
      .single();

    const { data: projectLead } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .eq("role", "lead")
      .single();

    if (userMembership?.role !== "admin" && !projectLead) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Remove member from project
    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("id", memberId)
      .eq("project_id", projectId);

    if (error) {
      console.error("Error removing project member:", error);
      return NextResponse.json(
        { error: "Failed to remove project member" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: true,
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
