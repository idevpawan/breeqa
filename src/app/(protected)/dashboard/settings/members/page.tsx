"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useOrganization,
  usePermission,
} from "@/lib/contexts/organization-context";
import { OrganizationMember, UserRole } from "@/lib/types/organization";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PERMISSIONS } from "@/lib/types/organization";
import { useRouter } from "next/navigation";

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-800",
  manager: "bg-blue-100 text-blue-800",
  developer: "bg-green-100 text-green-800",
  designer: "bg-purple-100 text-purple-800",
  qa: "bg-yellow-100 text-yellow-800",
  viewer: "bg-gray-100 text-gray-800",
};

export default function MembersPage() {
  const { currentOrganization } = useOrganization();
  const canInvite = usePermission("users:invite");
  const canManage = usePermission("users:manage");
  const router = useRouter();

  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer");
  const [error, setError] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [suspendedMembers, setSuspendedMembers] = useState<
    OrganizationMember[]
  >([]);
  const [rolePanelRole, setRolePanelRole] = useState<UserRole | null>(null);

  const loadMembers = useCallback(async () => {
    if (!currentOrganization) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/organizations/${currentOrganization.id}/members`
      );
      const data = await res.json();
      if (res.ok) {
        const all = data.data.members ?? data.data ?? [];
        setMembers(
          all.filter((m: OrganizationMember) => m.status === "active")
        );
        setSuspendedMembers(
          all.filter((m: OrganizationMember) => m.status === "suspended")
        );
      } else {
        setError(data.error || "Failed to load members");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization]);

  const loadInvites = useCallback(async () => {
    if (!currentOrganization) return;
    try {
      const res = await fetch(
        `/api/organizations/${currentOrganization.id}/invites`
      );
      const data = await res.json();
      if (res.ok) {
        setPendingInvites(data.data ?? []);
      }
    } catch {}
  }, [currentOrganization]);

  useEffect(() => {
    loadMembers();
    loadInvites();
  }, [loadMembers, loadInvites]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = `${m.user?.full_name ?? ""} ${m.user?.email ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" ? true : m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  const updateRole = async (userId: string, newRole: UserRole) => {
    if (!currentOrganization) return;
    const res = await fetch(
      `/api/organizations/${currentOrganization.id}/members/${userId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      }
    );
    const data = await res.json();
    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
      );
    } else {
      setError(data.error || "Failed to update role");
    }
  };

  const removeMember = async (userId: string) => {
    if (!currentOrganization) return;
    const res = await fetch(
      `/api/organizations/${currentOrganization.id}/members/${userId}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } else {
      setError(data.error || "Failed to remove member");
    }
  };

  const submitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;
    try {
      const res = await fetch("/api/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          organizationId: currentOrganization.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInviteEmail("");
        setInviteRole("viewer");
        setInviteOpen(false);
        loadInvites();
      } else {
        setError(data.error || "Failed to send invite");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Members</h1>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>Add member</Button>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 flex gap-3 flex-wrap items-center">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="qa">QA</option>
            <option value="viewer">Viewer</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
          {!isLoading && filteredMembers.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No members found.
            </div>
          )}
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {member.user?.full_name?.charAt(0) ||
                      member.user?.email?.charAt(0) ||
                      "?"}
                  </span>
                </div>
                <div>
                  <div className="font-medium">
                    {member.user?.full_name || "Unknown User"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {member.user?.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}
                        onClick={() => setRolePanelRole(member.role)}
                      >
                        {member.role}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs max-w-xs">
                        {member.role === "admin" &&
                          "Admins have full control over the organization."}
                        {member.role === "manager" &&
                          "Managers can create projects and assign issues but can’t delete them."}
                        {member.role === "developer" &&
                          "Developers can work on tasks and issues, not delete projects."}
                        {member.role === "designer" &&
                          "Designers can contribute design tasks and comment."}
                        {member.role === "qa" &&
                          "QA can test and report issues, and comment."}
                        {member.role === "viewer" &&
                          "Viewers have read-only access."}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => updateRole(member.user_id, "admin")}
                      disabled={!canManage}
                    >
                      Promote to Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateRole(member.user_id, "manager")}
                      disabled={!canManage}
                    >
                      Set Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateRole(member.user_id, "developer")}
                      disabled={!canManage}
                    >
                      Set Developer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateRole(member.user_id, "designer")}
                      disabled={!canManage}
                    >
                      Set Designer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateRole(member.user_id, "qa")}
                      disabled={!canManage}
                    >
                      Set QA
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateRole(member.user_id, "viewer")}
                      disabled={!canManage}
                    >
                      Set Viewer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => removeMember(member.user_id)}
                      className="text-red-600"
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invite member</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-3 text-sm text-red-600">{error}</div>
              )}
              <form onSubmit={submitInvite} className="space-y-3">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="viewer">Viewer</option>
                  <option value="qa">QA</option>
                  <option value="designer">Designer</option>
                  <option value="developer">Developer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Send invite</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending invites */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pending invites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingInvites.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No pending invites.
            </div>
          )}
          {pendingInvites.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div>
                <div className="font-medium">{inv.email}</div>
                <div className="text-xs text-muted-foreground">
                  Invited as {inv.role}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // naive resend: just re-create invite via same endpoint
                    setInviteEmail(inv.email);
                    setInviteRole(inv.role);
                    await submitInvite(
                      new Event("submit") as unknown as React.FormEvent
                    );
                  }}
                >
                  Resend
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (!currentOrganization) return;
                    const res = await fetch(
                      `/api/organizations/${currentOrganization.id}/invites/${inv.id}`,
                      { method: "DELETE" }
                    );
                    if (res.ok) {
                      setPendingInvites((prev) =>
                        prev.filter((i) => i.id !== inv.id)
                      );
                    }
                  }}
                >
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Suspended members */}
      {suspendedMembers.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Suspended members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suspendedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div>
                    <div className="font-medium">
                      {member.user?.full_name || "Unknown User"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.user?.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Suspended
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Sheet
        open={rolePanelRole !== null}
        onOpenChange={(open) => !open && setRolePanelRole(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="capitalize">
              {rolePanelRole ?? "Role"} permissions
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {rolePanelRole &&
              Object.entries(PERMISSIONS).map(([key, perm]) => {
                const allowed = perm.roles.includes(rolePanelRole);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <div className="text-sm font-medium">
                      {perm.resource}:{perm.action}
                    </div>
                    <div className="text-sm">{allowed ? "✅" : "❌"}</div>
                  </div>
                );
              })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
