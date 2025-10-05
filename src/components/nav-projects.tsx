"use client";

import React from "react";
import { Folder, MoreHorizontal, Share, Trash2, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ProjectCreationDialog } from "@/components/project-creation-dialog";
import { useProjects } from "@/lib/contexts/project-context";

export function NavProjects() {
  const { isMobile } = useSidebar();
  const { projects, isLoading, deleteProject } = useProjects();

  const handleProjectCreated = () => {
    // Projects will be automatically refreshed by the context
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await deleteProject(projectId);
      if (!response.success) {
        console.error("Failed to delete project:", response.error);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  if (isLoading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <Folder />
              <span>Loading...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.length === 0 ? (
          <SidebarMenuItem>
            <div className="flex flex-col gap-2 p-2">
              <p className="text-sm text-muted-foreground text-center">
                No projects yet
              </p>
              <ProjectCreationDialog onProjectCreated={handleProjectCreated}>
                <Button size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </ProjectCreationDialog>
            </div>
          </SidebarMenuItem>
        ) : (
          <>
            {projects.map((project) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild>
                  <a href={`/projects/${project.id}`}>
                    <Folder />
                    <span>{project.name}</span>
                  </a>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem>
                      <Folder className="text-muted-foreground" />
                      <span>View Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="text-muted-foreground" />
                      <span>Share Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete Project</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <ProjectCreationDialog onProjectCreated={handleProjectCreated}>
                <SidebarMenuButton>
                  <Plus />
                  <span>Create Project</span>
                </SidebarMenuButton>
              </ProjectCreationDialog>
            </SidebarMenuItem>
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
