"use client";

import React, { useEffect } from "react";
import { useUserStore } from "@/lib/stores/user-store";
import { useOrganizationStore } from "../stores/organization-store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loadUserProfile } = useUserStore();
  const { loadOrganizations } = useOrganizationStore();
  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, []);

  return <>{children}</>;
}
