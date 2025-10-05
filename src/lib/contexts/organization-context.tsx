"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  organizationServiceClient,
  hasPermission,
} from "@/lib/services/organization-client";
import {
  Organization,
  OrganizationMember,
  UserRole,
  OrganizationContextType,
} from "@/lib/types/organization";

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [memberships, setMemberships] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load user's organizations
  const loadOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await organizationServiceClient.getUserOrganizations();

      if (response.success && response.data) {
        setMemberships(
          response.data.organizations.map((org) => ({
            id: "",
            organization_id: org.id,
            user_id: "",
            role: "viewer" as UserRole,
            status: "active" as const,
            joined_at: "",
            created_at: "",
            updated_at: "",
            organization: org,
          }))
        );

        if (response.data.currentOrganization) {
          setCurrentOrganization(response.data.currentOrganization);
          // Get user's role in current organization
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            const { data: members } = await supabase
              .from("organization_members")
              .select("role")
              .eq("organization_id", response.data.currentOrganization.id)
              .eq("user_id", authUser.id)
              .eq("status", "active");

            if (members && members.length > 0) {
              setUserRole(members[0].role);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Switch to a different organization
  const switchOrganization = useCallback(
    async (orgId: string) => {
      try {
        const organization = memberships.find(
          (m) => m.organization_id === orgId
        )?.organization;
        if (!organization) {
          throw new Error("Organization not found");
        }

        setCurrentOrganization(organization);

        // Get user's role in the selected organization
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
            setUserRole(members[0].role);
          }
        }

        // Store current organization in localStorage for persistence
        localStorage.setItem("currentOrganizationId", orgId);
      } catch (error) {
        console.error("Error switching organization:", error);
        throw error;
      }
    },
    [memberships, supabase]
  );

  // Check if user has permission
  const hasPermissionCheck = useCallback(
    (permission: string): boolean => {
      return hasPermission(userRole, permission);
    },
    [userRole]
  );

  // Refresh organizations data
  const refreshOrganizations = useCallback(async () => {
    await loadOrganizations();
  }, [loadOrganizations]);

  // Initialize on mount
  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  // Restore last selected organization from localStorage
  useEffect(() => {
    const restoreOrganization = async () => {
      const savedOrgId = localStorage.getItem("currentOrganizationId");
      if (savedOrgId && memberships.length > 0) {
        const savedOrg = memberships.find(
          (m) => m.organization_id === savedOrgId
        );
        if (savedOrg) {
          setCurrentOrganization(savedOrg.organization!);
          // Get user's role
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            const { data: members } = await supabase
              .from("organization_members")
              .select("role")
              .eq("organization_id", savedOrgId)
              .eq("user_id", authUser.id)
              .eq("status", "active");

            if (members && members.length > 0) {
              setUserRole(members[0].role);
            }
          }
        }
      }
    };

    restoreOrganization();
  }, [memberships, supabase]);

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setCurrentOrganization(null);
        setUserRole(null);
        setMemberships([]);
        localStorage.removeItem("currentOrganizationId");
      } else if (event === "SIGNED_IN") {
        loadOrganizations();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, loadOrganizations]);

  const value: OrganizationContextType = {
    currentOrganization,
    userRole,
    memberships,
    isLoading,
    switchOrganization,
    hasPermission: hasPermissionCheck,
    refreshOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
}

// Higher-order component for role-based access control
export function withRole<T extends object>(
  requiredRole: UserRole,
  fallback?: React.ComponentType<T>
) {
  return function RoleProtectedComponent(Component: React.ComponentType<T>) {
    return function ProtectedComponent(props: T) {
      const { userRole, hasPermission } = useOrganization();

      // Check if user has the required role or higher
      const hasRequiredRole = userRole && hasPermission(`role:${requiredRole}`);

      if (!hasRequiredRole) {
        if (fallback) {
          return React.createElement(fallback, props);
        }
        return (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Access Denied
              </h3>
              <p className="text-muted-foreground">
                You don't have permission to access this resource.
              </p>
            </div>
          </div>
        );
      }

      return React.createElement(Component, props);
    };
  };
}

// Hook for permission checking
export function usePermission(permission: string) {
  const { hasPermission } = useOrganization();
  return hasPermission(permission);
}

// Hook for role checking
export function useRole(requiredRole: UserRole) {
  const { userRole } = useOrganization();
  return userRole === requiredRole;
}
