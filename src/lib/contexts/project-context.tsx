"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { organizationServiceClient } from "@/lib/services/organization-client";
import { Project, ApiResponse } from "@/lib/types/organization";
import { useOrganization } from "./organization-context";

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  createProject: (
    name: string,
    description?: string
  ) => Promise<ApiResponse<Project>>;
  updateProject: (
    projectId: string,
    updates: Partial<Pick<Project, "name" | "description" | "status">>
  ) => Promise<ApiResponse<Project>>;
  deleteProject: (projectId: string) => Promise<ApiResponse<boolean>>;
  setCurrentProject: (project: Project | null) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { currentOrganization } = useOrganization();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects for current organization
  const loadProjects = useCallback(async () => {
    if (!currentOrganization) {
      setProjects([]);
      setCurrentProject(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await organizationServiceClient.getOrganizationProjects(
        currentOrganization.id
      );

      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        console.error("Failed to load projects:", response.error);
        setError(response.error || "Failed to load projects");
        setProjects([]);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
      setError(err instanceof Error ? err.message : "Failed to load projects");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization]);

  // Create a new project
  const createProject = useCallback(
    async (
      name: string,
      description?: string
    ): Promise<ApiResponse<Project>> => {
      if (!currentOrganization) {
        return {
          data: null,
          error: "No organization selected",
          success: false,
        };
      }

      try {
        setError(null);
        const response = await organizationServiceClient.createProject(
          currentOrganization.id,
          name,
          description
        );

        if (response.success && response.data) {
          // Add the new project to the list
          setProjects((prev) => [response.data!, ...prev]);
        }

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create project";
        setError(errorMessage);
        return {
          data: null,
          error: errorMessage,
          success: false,
        };
      }
    },
    [currentOrganization]
  );

  // Update an existing project
  const updateProject = useCallback(
    async (
      projectId: string,
      updates: Partial<Pick<Project, "name" | "description" | "status">>
    ): Promise<ApiResponse<Project>> => {
      try {
        setError(null);
        const response = await organizationServiceClient.updateProject(
          projectId,
          updates
        );

        if (response.success && response.data) {
          // Update the project in the list
          setProjects((prev) =>
            prev.map((project) =>
              project.id === projectId ? response.data! : project
            )
          );

          // Update current project if it's the one being updated
          if (currentProject?.id === projectId) {
            setCurrentProject(response.data);
          }
        }

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update project";
        setError(errorMessage);
        return {
          data: null,
          error: errorMessage,
          success: false,
        };
      }
    },
    [currentProject]
  );

  // Delete a project
  const deleteProject = useCallback(
    async (projectId: string): Promise<ApiResponse<boolean>> => {
      try {
        setError(null);
        const response =
          await organizationServiceClient.deleteProject(projectId);

        if (response.success) {
          // Remove the project from the list
          setProjects((prev) =>
            prev.filter((project) => project.id !== projectId)
          );

          // Clear current project if it's the one being deleted
          if (currentProject?.id === projectId) {
            setCurrentProject(null);
          }
        }

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete project";
        setError(errorMessage);
        return {
          data: null,
          error: errorMessage,
          success: false,
        };
      }
    },
    [currentProject]
  );

  // Refresh projects (alias for loadProjects)
  const refreshProjects = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  // Load projects when organization changes
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Clear current project when organization changes
  useEffect(() => {
    setCurrentProject(null);
  }, [currentOrganization]);

  // Restore current project from localStorage
  useEffect(() => {
    const savedProjectId = localStorage.getItem("currentProjectId");
    if (savedProjectId && projects.length > 0) {
      const savedProject = projects.find((p) => p.id === savedProjectId);
      if (savedProject) {
        setCurrentProject(savedProject);
      }
    }
  }, [projects]);

  // Save current project to localStorage
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem("currentProjectId", currentProject.id);
    } else {
      localStorage.removeItem("currentProjectId");
    }
  }, [currentProject]);

  const value: ProjectContextType = {
    projects,
    currentProject,
    isLoading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}

// Hook for current project only
export function useCurrentProject() {
  const { currentProject, setCurrentProject } = useProjects();
  return { currentProject, setCurrentProject };
}

// Hook for project management actions
export function useProjectActions() {
  const { createProject, updateProject, deleteProject, refreshProjects } =
    useProjects();
  return { createProject, updateProject, deleteProject, refreshProjects };
}
