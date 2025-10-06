import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ProjectMember } from "@/lib/types/organization";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const projectId = params.id;

    // Get project members with user details
    const { data: members, error } = await supabase
      .from("project_members")
      .select(
        `
        *,
        user:user_profiles!user_id(*)
      `
      )
      .eq("project_id", projectId)
      .order("joined_at", { ascending: false });

    if (error) {
      console.error("Error fetching project members:", error);
      return NextResponse.json(
        { error: "Failed to fetch project members" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: members as ProjectMember[],
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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const projectId = params.id;
    const body = await request.json();
    const { userId, role, permissions = {} } = body;

    // Verify user has permission to add members to this project
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

    // Add member to project
    const { data: member, error } = await supabase
      .from("project_members")
      .insert({
        project_id: projectId,
        user_id: userId,
        role,
        permissions,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select(
        `
        *,
        user:user_profiles!user_id(*)
      `
      )
      .single();

    if (error) {
      console.error("Error adding project member:", error);
      return NextResponse.json(
        { error: "Failed to add project member" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: member as ProjectMember,
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
