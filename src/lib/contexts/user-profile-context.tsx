"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";

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

interface UserProfileContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Load user profile from database
  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setUserProfile(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        console.error("Error loading user profile:", profileError);
        // Fallback to auth user data if profile doesn't exist
        setUserProfile({
          id: authUser.id,
          email: authUser.email || "",
          full_name: authUser.user_metadata?.full_name || "",
          avatar_url: authUser.user_metadata?.avatar_url || "",
          timezone: "UTC",
          preferences: {},
          created_at: authUser.created_at || "",
          updated_at: authUser.created_at || "",
        });
      } else {
        setUserProfile(profile);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load user profile"
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    await loadUserProfile();
  }, [loadUserProfile]);

  // Update profile in database and local state
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!userProfile) return;

      try {
        setError(null);

        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userProfile.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Update local state
        setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
      } catch (err) {
        console.error("Error updating profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update profile"
        );
        throw err;
      }
    },
    [userProfile, supabase]
  );

  // Clear profile data (for logout)
  const clearProfile = useCallback(() => {
    setUserProfile(null);
    setError(null);
  }, []);

  // Load profile on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearProfile();
      } else if (event === "SIGNED_IN") {
        loadUserProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, loadUserProfile, clearProfile]);

  const value: UserProfileContextType = {
    userProfile,
    isLoading,
    error,
    refreshProfile,
    updateProfile,
    clearProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}

// Utility hooks for common use cases
export function useUserDisplayName() {
  const { userProfile } = useUserProfile();

  if (!userProfile) return "User";

  return userProfile.full_name || userProfile.email.split("@")[0];
}

export function useUserInitials() {
  const { userProfile } = useUserProfile();

  if (!userProfile) return "U";

  const displayName = userProfile.full_name || userProfile.email.split("@")[0];
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function useUserAvatar() {
  const { userProfile } = useUserProfile();

  return {
    avatarUrl: userProfile?.avatar_url,
    initials: useUserInitials(),
  };
}
