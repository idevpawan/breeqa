"use client";

import { create } from "zustand";
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

interface UserState {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  loadUserProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  userProfile: null,
  isLoading: true,
  error: null,

  loadUserProfile: async () => {
    const supabase = createClient();
    try {
      set({ isLoading: true, error: null });
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        set({ userProfile: null, isLoading: false });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        set({
          userProfile: {
            id: authUser.id,
            email: authUser.email || "",
            full_name: authUser.user_metadata?.full_name || "",
            avatar_url: authUser.user_metadata?.avatar_url || "",
            timezone: "UTC",
            preferences: {},
            created_at: authUser.created_at || "",
            updated_at: authUser.created_at || "",
          },
          isLoading: false,
          error: null,
        });
      } else {
        set({ userProfile: profile, isLoading: false, error: null });
      }
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to load user profile",
      });
    }
  },

  refreshProfile: async () => {
    await get().loadUserProfile();
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const supabase = createClient();
    const current = get().userProfile;
    if (!current) return;
    try {
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", current.id);
      if (updateError) throw new Error(updateError.message);

      set({ userProfile: { ...current, ...updates } as UserProfile });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update profile",
      });
      throw err;
    }
  },

  clearProfile: () => {
    set({ userProfile: null, error: null, isLoading: false });
  },
}));
