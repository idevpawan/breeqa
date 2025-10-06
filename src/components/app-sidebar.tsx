"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  CircleDot,
  Command,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  History,
  Send,
  Settings2,
  SquareTerminal,
  User,
  Users,
  BarChart3,
  Megaphone,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useOrganization } from "@/lib/contexts/organization-context";
import { OrganizationSwitcher } from "./team-switcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentOrganization, userRole } = useOrganization();

  const data = {
    navMain: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: "All Tickets",
        url: "/tickets",
        icon: CircleDot,
      },
      {
        title: "Members & Permissions",
        url: "/members",
        icon: Users,
      },
      {
        title: "Activity Log",
        url: "/activity",
        icon: History,
      },
      {
        title: "Billing",
        url: "/billing",
        icon: CreditCard,
      },
      {
        title: "Usage Analytics",
        url: "/usage",
        icon: BarChart3,
      },
      { title: "Settings", url: "#", icon: Settings2 },
    ],
    navSecondary: [
      {
        title: "Changelog",
        url: "/changelog",
        icon: Megaphone,
      },
      {
        title: "Keyboard Shortcuts",
        url: "/shortcuts",
        icon: Command,
      },
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
  };
  return (
    <Sidebar
      style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
