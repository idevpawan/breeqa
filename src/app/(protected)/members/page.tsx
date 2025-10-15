"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useOrganization } from "@/lib/contexts/organization-context";
import {
  OrganizationMember,
  PERMISSIONS,
  UserRole,
} from "@/lib/types/organization";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ROLE_ORDER: UserRole[] = [
  "admin",
  "manager",
  "developer",
  "designer",
  "qa",
  "viewer",
];

export default function MembersPage() {
  const { currentOrganization, isLoading: isLoadingOrganization } =
    useOrganization();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!currentOrganization) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/organizations/${currentOrganization.id}/members`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load members");
      }
      setMembers((data.data?.members ?? []) as OrganizationMember[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load members");
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (isLoadingOrganization) return;
    loadMembers();
  }, [isLoadingOrganization]);

  const filteredMembers = useMemo(() => {
    if (!search) return members;
    const q = search.toLowerCase();
    return members.filter((m) => {
      const name = m.user?.full_name?.toLowerCase() ?? "";
      const email = m.user?.email?.toLowerCase() ?? "";
      return (
        name.includes(q) ||
        email.includes(q) ||
        m.role.toLowerCase().includes(q)
      );
    });
  }, [members, search]);

  const allVisibleSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedIds.has(m.id));
  const someVisibleSelected = filteredMembers.some((m) =>
    selectedIds.has(m.id)
  );

  const toggleSelectAllVisible = () => {
    const next = new Set(selectedIds);
    if (allVisibleSelected) {
      filteredMembers.forEach((m) => next.delete(m.id));
    } else {
      filteredMembers.forEach((m) => next.add(m.id));
    }
    setSelectedIds(next);
  };

  const roleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "developer":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case "designer":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100";
      case "qa":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const permissionsByRole = (role: UserRole): string[] => {
    const allowed: string[] = [];
    Object.entries(PERMISSIONS).forEach(([key, cfg]) => {
      if (cfg.roles.includes(role)) allowed.push(key);
    });
    return allowed.sort();
  };

  const handleInvite = async () => {
    if (!currentOrganization) return;
    setIsInviting(true);
    setInviteError(null);
    try {
      const response = await fetch("/api/invite-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          organizationId: currentOrganization.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setInviteOpen(false);
        setInviteEmail("");
        setInviteRole("viewer");
        // Refresh the members list
        loadMembers();
      } else {
        throw new Error(data.error || "Failed to send invite");
      }
    } catch (e) {
      setInviteError(e instanceof Error ? e.message : "Failed to send invite");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage your organization members
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>Add member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a new member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                >
                  {ROLE_ORDER.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {inviteError && (
                <p className="text-sm text-red-600">{inviteError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail}
              >
                {isInviting ? "Sending..." : "Send invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex my-4 items-center gap-3">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {someVisibleSelected && (
          <Badge variant="secondary">{selectedIds.size} selected</Badge>
        )}
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  aria-label="Select all"
                />
              </th>
              <th className="p-3">Member</th>
              <th className="p-3">Role</th>
              <th className="p-3">Permissions</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={6}>
                  Loading members...
                </td>
              </tr>
            )}
            {!isLoading && error && (
              <tr>
                <td className="p-4 text-red-600" colSpan={6}>
                  {error}
                </td>
              </tr>
            )}
            {!isLoading && !error && filteredMembers.length === 0 && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={6}>
                  No members found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !error &&
              filteredMembers.map((m) => {
                const isSelected = selectedIds.has(m.id);
                const initials = (m.user?.full_name || m.user?.email || "?")
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const rolePerms = permissionsByRole(m.role).slice(0, 3);
                const extra = Math.max(
                  0,
                  permissionsByRole(m.role).length - rolePerms.length
                );
                return (
                  <tr key={m.id} className="border-t">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const next = new Set(selectedIds);
                          if (isSelected) next.delete(m.id);
                          else next.add(m.id);
                          setSelectedIds(next);
                        }}
                        aria-label={`Select ${m.user?.full_name || m.user?.email}`}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={m.user?.avatar_url}
                            alt={m.user?.full_name || m.user?.email}
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                          <div className="font-medium">
                            {m.user?.full_name || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {m.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center capitalize rounded px-2 py-0.5 text-xs font-medium ${roleBadgeVariant(m.role)}`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {rolePerms.map((p) => (
                          <Badge key={p} variant="outline">
                            {p}
                          </Badge>
                        ))}
                        {extra > 0 && (
                          <Badge variant="secondary">+{extra} more</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-xs">{formatDate(m.joined_at)}</td>
                    <td className="p-3 text-xs">
                      {m.status === "active" && (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          Active
                        </Badge>
                      )}
                      {m.status === "pending" && (
                        <Badge className="bg-amber-100 text-amber-800">
                          Pending
                        </Badge>
                      )}
                      {m.status === "suspended" && (
                        <Badge className="bg-gray-200 text-gray-800">
                          Suspended
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
