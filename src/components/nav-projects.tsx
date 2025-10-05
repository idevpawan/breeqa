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
import Link from "next/link";
import Image from "next/image";

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

  // if (isLoading) {
  //   return (
  //     <SidebarGroup className="group-data-[collapsible=icon]:hidden">
  //       <SidebarGroupLabel>Projects</SidebarGroupLabel>
  //       <SidebarMenu>
  //         <div className="flex flex-col gap-2 p-2">
  //           <div className="size-8 w-[60%] animate-pulse rounded-lg bg-muted"></div>
  //           <div className="size-8 w-[40%] animate-pulse rounded-lg bg-muted"></div>
  //         </div>
  //       </SidebarMenu>
  //     </SidebarGroup>
  //   );
  // }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {!isLoading && projects.length === 0 ? (
          <SidebarMenuItem>
            <div className="flex flex-col gap-2 p-2">
              <p className="text-sm text-muted-foreground text-">
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
                  <Link href={`/projects/${project.id}`}>
                    {project.icon ? (
                      <Image
                        src={project.icon}
                        alt={project.name}
                        width={20}
                        height={20}
                      />
                    ) : (
                      <Folder />
                    )}
                    <span>{project.name}</span>
                  </Link>
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
