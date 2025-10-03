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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  B
                </span>
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">
                  BREEQA
                </span>
                {currentOrganization && (
                  <div className="text-sm text-muted-foreground">
                    {currentOrganization.name}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to {currentOrganization.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              You&apos;re logged in as{" "}
              <span className="font-medium capitalize">{userRole}</span>
            </p>
            {currentOrganization.description && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {currentOrganization.description}
              </p>
            )}
          </div>

          {/* Organization Info Card */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Information about your current organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Organization Name
                </label>
                <p className="text-sm">{currentOrganization.name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Organization Slug
                </label>
                <p className="text-sm font-mono">{currentOrganization.slug}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Your Role
                </label>
                <p className="text-sm capitalize font-medium">{userRole}</p>
              </div>
              {currentOrganization.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-sm">{currentOrganization.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
                  <span>Create Project</span>
                </CardTitle>
                <CardDescription>
                  Start a new project and invite your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled={!canManageProjects}>
                  {canManageProjects ? "Create Project" : "No Permission"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                  <span>Invite Members</span>
                </CardTitle>
                <CardDescription>
                  Invite team members to your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!canInviteUsers}
                >
                  {canInviteUsers ? "Invite Members" : "No Permission"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                  <span>Organization Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your organization settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/settings")}
                >
                  Manage Organization
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Organization Members */}
          {memberships.length > 1 && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Your Organizations</CardTitle>
                <CardDescription>
                  You&apos;re a member of {memberships.length} organization
                  {memberships.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {memberships.map((membership) => (
                    <div
                      key={membership.organization_id}
                      className={`p-3 rounded-lg border ${
                        membership.organization_id === currentOrganization.id
                          ? "bg-primary/5 border-primary"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {membership.organization?.name}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {membership.role}
                          </p>
                        </div>
                        {membership.organization_id !==
                          currentOrganization.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement organization switching
                            }}
                          >
                            Switch
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back to Home */}
          <div className="text-center">
            <Button variant="ghost" asChild>
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
