"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, Palette, Hash, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjects } from "@/lib/contexts/project-context";
import { useOrganization } from "@/lib/contexts/organization-context";
import { ProjectMember, UserProfile } from "@/lib/types/organization";
import { organizationServiceClient } from "@/lib/services/organization-client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ProjectCreationDialogProps {
  onProjectCreated?: () => void;
  children?: React.ReactNode;
}

export function ProjectCreationDialog({
  onProjectCreated,
  children,
}: ProjectCreationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"basic" | "team">("basic");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: "#3b82f6",
  });
  const [selectedMembers, setSelectedMembers] = useState<UserProfile[]>([]);
  const [availableMembers, setAvailableMembers] = useState<UserProfile[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const { createProject, setCurrentProject } = useProjects();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const router = useRouter();

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Load organization members
  useEffect(() => {
    const loadMembers = async () => {
      if (currentOrganization && open) {
        setLoadingMembers(true);
        try {
          const response = await fetch(
            `/api/organizations/${currentOrganization.id}/members`
          );
          const data = await response.json();

          if (data.success && data.data) {
            const members = data.data.members;
            setOrganizationMembers(members);
            setAvailableMembers(
              members.map((member: any) => member.user).filter(Boolean)
            );
          } else {
            console.error("Failed to load organization members:", data.error);
            setAvailableMembers([]);
            setOrganizationMembers([]);
          }
        } catch (error) {
          console.error("Error loading organization members:", error);
          setAvailableMembers([]);
        } finally {
          setLoadingMembers(false);
        }
      }
    };

    loadMembers();
  }, [currentOrganization, open]);

  // Update slug when name changes
  useEffect(() => {
    if (formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(formData.name) }));
    }
  }, [formData.name]);

  // Validation functions
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Project name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Project name must be at least 3 characters";
    } else if (formData.name.trim().length > 100) {
      errors.name = "Project name must be less than 100 characters";
    }

    // Slug validation
    if (formData.slug && formData.slug.length > 0) {
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        errors.slug =
          "Slug can only contain lowercase letters, numbers, and hyphens";
      } else if (formData.slug.length < 3) {
        errors.slug = "Slug must be at least 3 characters";
      } else if (formData.slug.length > 50) {
        errors.slug = "Slug must be less than 50 characters";
      }
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear validation errors when form data changes
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
  }, [formData]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        name: "",
        slug: "",
        description: "",
        color: "#3b82f6",
      });
      setSelectedMembers([]);
      setStep("basic");
      setError(null);
    }
    setOpen(newOpen);
  };

  const handleNext = () => {
    if (step === "basic") {
      if (!validateForm()) {
        return;
      }
      setStep("team");
    }
  };

  const handleCreateProject = async () => {
    if (step !== "team") return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await createProject(
        formData.name.trim(),
        formData.description.trim() || undefined,
        formData.slug.trim() || undefined,
        formData.color
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create project");
      }

      // Add project members if any were selected
      if (selectedMembers.length > 0) {
        try {
          for (const selectedMember of selectedMembers) {
            // Find the organization member to get their role
            const orgMember = organizationMembers.find(
              (om: any) => om.user.id === selectedMember.id
            );
            if (orgMember) {
              // Map organization role to project role
              let projectRole: "lead" | "tester" | "observer";
              switch (orgMember.role) {
                case "admin":
                case "manager":
                  projectRole = "lead";
                  break;
                case "qa":
                  projectRole = "tester";
                  break;
                default:
                  projectRole = "observer";
              }

              await organizationServiceClient.addProjectMember(
                response.data.id,
                selectedMember.id,
                projectRole
              );
            }
          }
        } catch (memberError) {
          console.warn("Failed to add some project members:", memberError);
          // Don't fail the entire project creation if member addition fails
          toast({
            title: "Project created with warnings",
            description:
              "Project was created but some team members couldn't be added. You can add them later.",
            variant: "default",
          });
        }
      }

      // Set as current project
      setCurrentProject(response.data);

      // Show success toast
      toast({
        title: "Project created successfully!",
        description: `"${formData.name}" has been created and is ready to use.`,
        variant: "success",
      });

      // Reset form and close dialog
      setFormData({
        name: "",
        slug: "",
        description: "",
        color: "#3b82f6",
      });
      setSelectedMembers([]);
      setStep("basic");
      setOpen(false);

      // Redirect to project page
      router.push(`/projects/${response.data.id}`);

      // Notify parent component
      if (onProjectCreated) {
        onProjectCreated();
      }
    } catch (error) {
      console.error("Project creation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create project";
      setError(errorMessage);

      // Show error toast
      toast({
        title: "Failed to create project",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "team") {
      setStep("basic");
    }
  };

  const handleMemberToggle = (user: UserProfile) => {
    setSelectedMembers((prev) => {
      const existing = prev.find((m) => m.id === user.id);
      if (existing) {
        return prev.filter((m) => m.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddAll = () => {
    setSelectedMembers(availableMembers);
  };

  const handleAddByRole = (role: string) => {
    const membersByRole = organizationMembers
      .filter((member: any) => member.role === role)
      .map((member: any) => member.user)
      .filter(Boolean);

    setSelectedMembers((prev) => {
      const newMembers = membersByRole.filter(
        (member) => !prev.find((m) => m.id === member.id)
      );
      return [...prev, ...newMembers];
    });
  };

  const handleClearAll = () => {
    setSelectedMembers([]);
  };

  const renderStepContent = () => {
    switch (step) {
      case "basic":
        return (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter project name"
                required
                disabled={isLoading}
                className={validationErrors.name ? "border-destructive" : ""}
              />
              {validationErrors.name && (
                <p className="text-sm text-destructive">
                  {validationErrors.name}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Project Slug</Label>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="project-slug"
                  disabled={isLoading}
                  className={validationErrors.slug ? "border-destructive" : ""}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Used in URLs and must be unique within your organization
              </p>
              {validationErrors.slug && (
                <p className="text-sm text-destructive">
                  {validationErrors.slug}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter project description"
                disabled={isLoading}
                rows={3}
                className={
                  validationErrors.description ? "border-destructive" : ""
                }
              />
              {validationErrors.description && (
                <p className="text-sm text-destructive">
                  {validationErrors.description}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Project Color</Label>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-16 h-10 p-1"
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">
                  Choose a color to identify this project
                </span>
              </div>
            </div>
          </div>
        );

      case "team":
        return (
          <div className="grid gap-4 py-4">
            <div className="text-sm text-muted-foreground">
              Select team members to add to your project
            </div>

            {/* Bulk selection buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAll}
                disabled={loadingMembers || availableMembers.length === 0}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add All
              </Button>

              {["admin", "manager", "qa", "member"].map((role) => {
                const count = organizationMembers.filter(
                  (m: any) => m.role === role
                ).length;
                if (count === 0) return null;

                return (
                  <Button
                    key={role}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddByRole(role)}
                    disabled={loadingMembers}
                    className="capitalize"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Add {role}s ({count})
                  </Button>
                );
              })}

              {selectedMembers.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={loadingMembers}
                >
                  Clear All
                </Button>
              )}
            </div>

            {loadingMembers ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                      <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : availableMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No team members found
                </h3>
                <p className="text-muted-foreground text-sm">
                  This organization doesn't have any members yet, or you don't
                  have permission to view them.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableMembers.map((member) => {
                  const isSelected = selectedMembers.find(
                    (m) => m.id === member.id
                  );
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleMemberToggle(member)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.full_name?.charAt(0) ||
                              member.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {member.full_name || member.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedMembers.length > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium mb-2">
                  Selected Team Members ({selectedMembers.length})
                </div>
                <div className="space-y-1">
                  {selectedMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Users className="h-3 w-3" />
                      <span>{member.full_name || member.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <div>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              {step === "basic" && "Set up your project with basic information"}
              {step === "team" && "Add team members and assign roles"}
            </DialogDescription>
          </DialogHeader>

          {renderStepContent()}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {step !== "basic" && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            {step !== "team" ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading || !formData.name.trim()}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCreateProject}
                disabled={isLoading || !formData.name.trim()}
              >
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
