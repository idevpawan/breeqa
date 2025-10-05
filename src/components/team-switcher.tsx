"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOrganization } from "@/lib/contexts/organization-context";
import { OrganizationCreationForm } from "@/components/organization-creation-form";

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const {
    currentOrganization,
    memberships,
    isLoading,
    switchOrganization,
    userRole,
  } = useOrganization();
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  // Get organization icon based on name or use default
  const getOrganizationIcon = (orgName: string) => {
    const firstLetter = orgName.charAt(0).toUpperCase();
    return firstLetter;
  };

  // Get organization role display
  const getOrganizationRole = (orgId: string) => {
    const membership = memberships.find((m) => m.organization_id === orgId);
    return membership?.role.toLowerCase() || "viewer";
  };

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="size-8 animate-pulse rounded-lg bg-foreground"></div>
            <div className="grid flex-1 gap-2">
              <div className="size-2 w-[50%] animate-pulse rounded-lg bg-foreground"></div>
              <div className="size-2 w-[30%] animate-pulse rounded-lg bg-foreground"></div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!currentOrganization) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => setShowCreateDialog(true)}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Plus className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Create Organization</span>
              <span className="truncate text-xs">Get started</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <span className="text-sm capitalize font-semibold">
                    {getOrganizationIcon(currentOrganization.name)}
                  </span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate capitalize font-medium">
                    {currentOrganization.name}
                  </span>
                  <span className="truncate text-xs capitalize">
                    {userRole}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>
              {memberships.map((membership, index) => {
                const org = membership.organization;
                if (!org) return null;

                return (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => switchOrganization(org.id)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 capitalize items-center justify-center rounded-md border bg-background">
                      <span className="text-xs font-semibold">
                        {getOrganizationIcon(org.name)}
                      </span>
                    </div>
                    <div className="flex flex-col capitalize">
                      <span className="font-medium">{org.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {getOrganizationRole(org.id)}
                      </span>
                    </div>
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setShowCreateDialog(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Create Organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <OrganizationCreationForm
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
