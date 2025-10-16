import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's email from their profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    if (!profile?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 404 }
      );
    }

    // Get pending invitations for this email
    const { data: invitations, error } = await supabase
      .from("organization_invitations")
      .select(
        `
        *,
        organization:organizations(*),
        inviter:user_profiles!invited_by(*)
      `
      )
      .eq("email", profile.email)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading user invitations:", error);
      return NextResponse.json(
        { error: "Failed to load invitations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: invitations || [],
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

