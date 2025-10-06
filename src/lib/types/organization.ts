// Organization-related types and interfaces

export type UserRole =
  | "admin"
  | "manager"
  | "developer"
  | "designer"
  | "qa"
  | "viewer";
export type MemberStatus = "active" | "pending" | "suspended";
export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  timezone: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  status: MemberStatus;
  invited_by?: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: UserProfile;
  organization?: Organization;
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: UserRole;
  token: string;
  invited_by: string;
  expires_at: string;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  organization?: Organization;
  inviter?: UserProfile;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active" | "archived" | "completed";
  icon?: string;
  color?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  organization?: Organization;
  creator?: UserProfile;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: "lead" | "tester" | "observer";
  permissions: Record<string, boolean>;
  joined_at: string;
  invited_by?: string;
  // Joined data
  user?: UserProfile;
  project?: Project;
}

// Permission system
export interface Permission {
  resource: string;
  action: string;
  roles: UserRole[];
}

export const PERMISSIONS: Record<string, Permission> = {
  // Organization Management
  "org:manage": {
    resource: "organization",
    action: "manage",
    roles: ["admin"],
  },
  "org:settings": {
    resource: "organization",
    action: "settings",
    roles: ["admin", "manager"],
  },
  "org:view": {
    resource: "organization",
    action: "view",
    roles: ["admin", "manager", "developer", "designer", "qa", "viewer"],
  },

  // User Management
  "users:invite": {
    resource: "users",
    action: "invite",
    roles: ["admin", "manager"],
  },
  "users:manage": {
    resource: "users",
    action: "manage",
    roles: ["admin"],
  },
  "users:view": {
    resource: "users",
    action: "view",
    roles: ["admin", "manager"],
  },

  // Project Management
  "projects:create": {
    resource: "projects",
    action: "create",
    roles: ["admin", "manager"],
  },
  "projects:manage": {
    resource: "projects",
    action: "manage",
    roles: ["admin", "manager"],
  },
  "projects:view": {
    resource: "projects",
    action: "view",
    roles: ["admin", "manager", "developer", "designer", "qa", "viewer"],
  },

  // Issues & Tasks
  "issues:create": {
    resource: "issues",
    action: "create",
    roles: ["admin", "manager", "developer", "designer", "qa"],
  },
  "issues:manage": {
    resource: "issues",
    action: "manage",
    roles: ["admin", "manager"],
  },
  "issues:view": {
    resource: "issues",
    action: "view",
    roles: ["admin", "manager", "developer", "designer", "qa", "viewer"],
  },
};

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  manager: 4,
  developer: 3,
  designer: 3,
  qa: 3,
  viewer: 1,
};

// Organization context for React components
export interface OrganizationContextType {
  currentOrganization: Organization | null;
  userRole: UserRole | null;
  memberships: OrganizationMember[];
  isLoading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshOrganizations: () => Promise<void>;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface OrganizationListResponse {
  organizations: Organization[];
  currentOrganization: Organization | null;
}

export interface MemberListResponse {
  members: OrganizationMember[];
  total: number;
  page: number;
  limit: number;
}

export interface InvitationListResponse {
  invitations: OrganizationInvitation[];
  total: number;
  page: number;
  limit: number;
}
