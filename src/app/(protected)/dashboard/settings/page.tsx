"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  useOrganization,
  usePermission,
} from "@/lib/contexts/organization-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { organizationServiceClient } from "@/lib/services/organization-client";
import { OrganizationMember, UserRole } from "@/lib/types/organization";

export default function OrganizationSettingsPage() {
  const { currentOrganization } = useOrganization();
  const canManageOrg = usePermission("org:manage");
  const canInviteUsers = usePermission("users:invite");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer");
  const [members, setMembers] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const loadMembers = useCallback(async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select(
          `
          *,
          user:user_profiles(*)
        `
        )
        .eq("organization_id", currentOrganization.id)
        .order("joined_at", { ascending: false });

      if (error) {
        console.error("Error loading members:", error);
        return;
      }

      setMembers(data || []);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  }, [currentOrganization, supabase]);

  useEffect(() => {
    if (currentOrganization) {
      loadMembers();
    }
  }, [currentOrganization, loadMembers]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !canInviteUsers) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to invite users");
        return;
      }

      const response = await organizationServiceClient.inviteUser(
        currentOrganization.id,
        inviteEmail,
        inviteRole
      );

      if (!response.success || !response.data) {
        setError(response.error || "Failed to send invitation");
        return;
      }

      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("viewer");
    } catch (error) {
      console.error("Error inviting user:", error);
      setError("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            No Organization Found
          </h1>
          <p className="text-muted-foreground mb-4">
            You need to be part of an organization to access settings.
          </p>
          <Button onClick={() => router.push("/onboarding")}>
            Create Organization
          </Button>
        </div>
      </div>
    );
  }

  if (!canManageOrg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to manage this organization.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
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
                <div className="text-sm text-muted-foreground">
                  {currentOrganization.name} Settings
                </div>
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
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input value={currentOrganization.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Organization Slug</Label>
                  <Input value={currentOrganization.slug} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={currentOrganization.description || ""}
                  disabled
                  placeholder="No description provided"
                />
              </div>
            </CardContent>
          </Card>

          {/* Invite Members */}
          {canInviteUsers && (
            <Card>
              <CardHeader>
                <CardTitle>Invite Team Members</CardTitle>
                <CardDescription>
                  Invite new members to your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteUser} className="space-y-4">
                  {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-600">{success}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        value={inviteRole}
                        onChange={(e) =>
                          setInviteRole(e.target.value as UserRole)
                        }
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="qa">QA</option>
                        <option value="designer">Designer</option>
                        <option value="developer">Developer</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !inviteEmail.trim()}
                  >
                    {isLoading ? "Sending..." : "Send Invitation"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Current Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Current members of your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.user?.full_name?.charAt(0) ||
                            member.user?.email?.charAt(0) ||
                            "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.user?.full_name || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : member.role === "manager"
                            ? "bg-orange-100 text-orange-800"
                            : member.role === "developer"
                            ? "bg-blue-100 text-blue-800"
                            : member.role === "designer"
                            ? "bg-purple-100 text-purple-800"
                            : member.role === "qa"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.role}
                      </span>
                      {member.status === "pending" && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Back to Dashboard */}
          <div className="text-center">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
