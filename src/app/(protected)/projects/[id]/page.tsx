"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/lib/contexts/project-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { projects, currentProject, isLoading } = useProjects();

  const project = projects.find((p) => p.id === projectId) || currentProject;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Project not found
          </h1>
          <p className="text-muted-foreground mt-2">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Project Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: project.color || "#3b82f6" }}
          />
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <Badge variant="outline">{project.status}</Badge>
        </div>
        {project.description && (
          <p className="text-muted-foreground text-lg">{project.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Created {new Date(project.created_at).toLocaleDateString()}
          </span>
          {project.slug && <span>Slug: {project.slug}</span>}
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Details</CardTitle>
            <CardDescription>Basic project information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge
                variant={project.status === "active" ? "default" : "secondary"}
              >
                {project.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Organization:
              </span>
              <span className="text-sm">{project.organization?.name}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common project tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Project management features coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
            <CardDescription>Project collaborators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Team management features coming soon...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Dashboard</CardTitle>
          <CardDescription>
            Your project workspace is ready. More features coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">
              Welcome to {project.name}!
            </h3>
            <p className="text-muted-foreground">
              Your project has been created successfully. We're working on
              adding more features like issue tracking, team management, and
              project analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
