"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useOrganization } from "@/lib/contexts/organization-context";
import { usePermission } from "@/lib/contexts/organization-context";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { currentOrganization, userRole, memberships, isLoading } =
    useOrganization();
  const canManageProjects = usePermission("projects:create");
  const canInviteUsers = usePermission("users:invite");
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            No Organization Found
          </h1>
          <p className="text-muted-foreground mb-4">
            You need to be part of an organization to access the dashboard.
          </p>
          <Button onClick={() => router.push("/onboarding")}>
            Create Organization
          </Button>
        </div>
      </div>
    );
  }

  return <div className="bg-background">{/* Main Content */}</div>;
}
