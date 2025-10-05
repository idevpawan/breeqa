import { createClient } from "@/lib/supabase/client";
import {
  Organization,
  UserProfile,
  OrganizationMember,
  OrganizationInvitation,
  Project,
  UserRole,
  ApiResponse,
  OrganizationListResponse,
  MemberListResponse,
  InvitationListResponse,
  PERMISSIONS,
  ROLE_HIERARCHY,
} from "@/lib/types/organization";
import { emailService } from "./email-service";

// Client-side organization service
export class OrganizationServiceClient {
  private supabase = createClient();

  // Get user's organizations (client-side)
  async getUserOrganizations(): Promise<ApiResponse<OrganizationListResponse>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: "Not authenticated", success: false };
      }

      const { data: memberships, error } = await this.supabase
        .from("organization_members")
        .select(
          `
          organization_id,
          role,
          joined_at,
          organization:organizations(*)
        `
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("joined_at", { ascending: false });

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      const organizations = memberships
        ?.map((m: any) => m.organization)
        .filter(Boolean) as Organization[];
      const currentOrganization = organizations[0] || null;

      return {
        data: { organizations, currentOrganization },
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  // Accept invitation (client-side)
  async acceptInvitation(
    token: string,
    userId: string
  ): Promise<ApiResponse<OrganizationMember>> {
    try {
      // Get invitation details
      const { data: invitation, error: invError } = await this.supabase
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
        return {
          data: null,
          error: "Invalid or expired invitation",
          success: false,
        };
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        return { data: null, error: "Invitation has expired", success: false };
      }

      // Add user to organization
      const { data: member, error: memberError } = await this.supabase
        .from("organization_members")
        .insert({
          organization_id: invitation.organization_id,
          user_id: userId,
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
        return { data: null, error: memberError.message, success: false };
      }

      // Update invitation status
      await this.supabase
        .from("organization_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);

      return { data: member, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  // Create organization (client-side)
  async createOrganization(
    name: string,
    slug: string,
    description: string
  ): Promise<ApiResponse<Organization>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: "Not authenticated", success: false };
      }

      // Check if slug is available
      const { data: existingOrg } = await this.supabase
        .from("organizations")
        .select("id")
        .eq("slug", slug)
        .single();

      if (existingOrg) {
        return {
          data: null,
          error: "Organization slug already exists",
          success: false,
        };
      }

      // Create organization
      const { data: organization, error: orgError } = await this.supabase
        .from("organizations")
        .insert({
          name,
          slug,
          description,
          created_by: user.id,
        })
        .select()
        .single();

      if (orgError) {
        return { data: null, error: orgError.message, success: false };
      }

      // Add creator as admin
      const { error: memberError } = await this.supabase
        .from("organization_members")
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          role: "admin",
          status: "active",
        });

      if (memberError) {
        return { data: null, error: memberError.message, success: false };
      }

      return { data: organization, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  // Invite user (client-side)
  async inviteUser(
    organizationId: string,
    email: string,
    role: UserRole
  ): Promise<ApiResponse<OrganizationInvitation>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: "Not authenticated", success: false };
      }

      // Check if user is already a member by email
      const { data: isMember } = await this.supabase.rpc("is_email_member", {
        org_uuid: organizationId,
        email_address: email,
      });

      if (isMember) {
        return {
          data: null,
          error: "User is already a member of this organization",
          success: false,
        };
      }

      // Check for existing pending invitation
      const { data: existingInvitation } = await this.supabase
        .from("organization_invitations")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("email", email)
        .eq("status", "pending")
        .single();

      if (existingInvitation) {
        return {
          data: null,
          error: "Invitation already sent to this email",
          success: false,
        };
      }

      // Generate invitation token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data: invitation, error } = await this.supabase
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

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      // Send invitation email
      try {
        const emailResult = await emailService.sendInvitationEmail(invitation);
        if (!emailResult.success) {
          console.warn("Failed to send invitation email:", emailResult.error);
          // Don't fail the invitation creation if email fails
          // The invitation is still created in the database
        }
      } catch (emailError) {
        console.warn("Email service error:", emailError);
        // Don't fail the invitation creation if email fails
      }

      return { data: invitation, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  // Get organization members (client-side)
  async getOrganizationMembers(
    organizationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<MemberListResponse>> {
    try {
      const offset = (page - 1) * limit;

      const {
        data: members,
        error,
        count,
      } = await this.supabase
        .from("organization_members")
        .select(
          `
          *,
          user:user_profiles!user_id(*)
        `,
          { count: "exact" }
        )
        .eq("organization_id", organizationId)
        .order("joined_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return {
        data: {
          members: members || [],
          total: count || 0,
          page,
          limit,
        },
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  // Update organization logo (client-side)
  async updateOrganizationLogo(
    organizationId: string,
    logoUrl: string
  ): Promise<ApiResponse<Organization>> {
    try {
      const { data: organization, error } = await this.supabase
        .from("organizations")
        .update({ logo_url: logoUrl })
        .eq("id", organizationId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: organization, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  // Get organization projects (client-side)
  async getOrganizationProjects(
    organizationId: string
  ): Promise<ApiResponse<Project[]>> {
    try {
      const { data: projects, error } = await this.supabase
        .from("projects")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: projects || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  // Create project (client-side)
  async createProject(
    organizationId: string,
    name: string,
    description?: string
  ): Promise<ApiResponse<Project>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: "Not authenticated", success: false };
      }

      const { data: project, error } = await this.supabase
        .from("projects")
        .insert({
          organization_id: organizationId,
          name,
          description,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: project, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  // Update project (client-side)
  async updateProject(
    projectId: string,
    updates: Partial<Pick<Project, "name" | "description" | "status">>
  ): Promise<ApiResponse<Project>> {
    try {
      const { data: project, error } = await this.supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: project, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  // Delete project (client-side)
  async deleteProject(projectId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }
}

// Utility functions
export function hasPermission(
  userRole: UserRole | null,
  permission: string
): boolean {
  if (!userRole) return false;

  const permissionConfig = PERMISSIONS[permission];
  if (!permissionConfig) return false;

  return permissionConfig.roles.includes(userRole);
}

export function canManageRole(
  userRole: UserRole,
  targetRole: UserRole
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];

  return userLevel > targetLevel;
}

// Export instance
export const organizationServiceClient = new OrganizationServiceClient();
