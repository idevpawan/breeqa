"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { organizationServiceClient } from "@/lib/services/organization-client";
import {
  Organization,
  OrganizationMember,
  UserRole,
} from "@/lib/types/organization";
import { hasPermission as hasPermissionHelper } from "@/lib/helpers/organization-helpers";

interface OrganizationState {
  currentOrganization: Organization | null;
  userRole: UserRole | null;
  memberships: OrganizationMember[];
  isLoading: boolean;
  error: string | null;

  loadOrganizations: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  clear: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  currentOrganization: null,
  userRole: null,
  memberships: [],
  isLoading: true,
  error: null,

  loadOrganizations: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await organizationServiceClient.getUserOrganizations();
      if (response.success && response.data) {
        const memberships = response.data.organizations.map((org) => ({
          id: "",
          organization_id: org.id,
          user_id: "",
          role: org.role as UserRole,
          status: "active" as const,
          joined_at: "",
          created_at: "",
          updated_at: "",
          organization: org,
        }));
        let currentOrganization = response.data.currentOrganization;

        // Try to restore saved org preference
        const savedOrgId =
          typeof window !== "undefined"
            ? localStorage.getItem("currentOrganizationId")
            : null;
        if (savedOrgId) {
          const saved = memberships.find(
            (m) => m.organization_id === savedOrgId
          )?.organization;
          if (saved) currentOrganization = saved;
        }

        let userRole: UserRole | null = null;
        if (currentOrganization) {
          userRole = memberships.find(
            (m) => m.organization_id === currentOrganization.id
          )?.role as UserRole;
        }

        set({ currentOrganization, memberships, userRole, isLoading: false });
      } else {
        set({
          currentOrganization: null,
          memberships: [],
          userRole: null,
          isLoading: false,
          error: response.error || "Failed to load organizations",
        });
      }
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to load organizations",
      });
    }
  },

  switchOrganization: async (orgId: string) => {
    const supabase = createClient();
    const { memberships } = get();
    const organization = memberships.find(
      (m) => m.organization_id === orgId
    )?.organization;
    if (!organization) throw new Error("Organization not found");

    let userRole: UserRole | null = null;
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser) {
      const { data: members } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", orgId)
        .eq("user_id", authUser.id)
        .eq("status", "active");
      if (members && members.length > 0) {
        userRole = members[0].role as UserRole;
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("currentOrganizationId", orgId);
    }

    set({ currentOrganization: organization, userRole });
  },

  refreshOrganizations: async () => {
    await get().loadOrganizations();
  },

  hasPermission: (permission: string) => {
    return hasPermissionHelper(get().userRole, permission);
  },

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentOrganizationId");
    }
    set({
      currentOrganization: null,
      userRole: null,
      memberships: [],
      isLoading: false,
      error: null,
    });
  },
}));
