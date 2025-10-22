"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { organizationServiceClient } from "@/lib/services/organization-client";
import { MediaService } from "@/lib/storage/media-service";
import { FILE_SIZE_LIMITS } from "@/lib/storage/wasabi-config";
import { useOrganizationStore } from "@/lib/stores/organization-store";
import { Loader2, Image, X } from "lucide-react";

interface OrganizationCreationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationCreationForm({
  open,
  onOpenChange,
}: OrganizationCreationFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
  });
  const [selectedLogo, setSelectedLogo] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const { refreshOrganizations } = useOrganizationStore();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }
  };

  const handleLogoSelect = (file: File) => {
    setSelectedLogo(file);
    setError(null);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const handleLogoRemove = () => {
    setSelectedLogo(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error("Organization name is required");
      }
      if (!formData.slug.trim()) {
        throw new Error("Organization slug is required");
      }
      if (formData.slug.length < 3) {
        throw new Error("Organization slug must be at least 3 characters");
      }
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        throw new Error(
          "Organization slug can only contain lowercase letters, numbers, and hyphens"
        );
      }

      // Create organization
      const response = await organizationServiceClient.createOrganization(
        formData.name.trim(),
        formData.slug.trim(),
        formData.description.trim()
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create organization");
      }

      // Upload logo if selected
      if (selectedLogo && response.data) {
        try {
          const logoUploadResult = await MediaService.uploadOrganizationLogo(
            response.data.id,
            selectedLogo
          );

          if (logoUploadResult.success && logoUploadResult.publicUrl) {
            // Update organization with logo URL
            await organizationServiceClient.updateOrganizationLogo(
              response.data.id,
              logoUploadResult.publicUrl
            );
          }
        } catch (logoError) {
          console.warn(
            "Logo upload failed, but organization was created:",
            logoError
          );
          // Don't fail the entire process if logo upload fails
        }
      }

      // Refresh organizations list
      await refreshOrganizations();

      // Reset form and close dialog
      setFormData({ name: "", slug: "", description: "" });
      setSelectedLogo(null);
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Organization creation error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({ name: "", slug: "", description: "" });
      setSelectedLogo(null);
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload Section */}
          <div className="space-y-2">
            <Label>Organization Logo (Optional)</Label>
            {logoPreview ? (
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedLogo?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedLogo?.size || 0) / 1024 / 1024 < 1
                      ? `${((selectedLogo?.size || 0) / 1024).toFixed(1)} KB`
                      : `${((selectedLogo?.size || 0) / 1024 / 1024).toFixed(
                          1
                        )} MB`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLogoRemove}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <FileUpload
                selectedFile={selectedLogo}
                onFileSelect={handleLogoSelect}
                onFileRemove={handleLogoRemove}
                accept="image/*"
                maxSize={FILE_SIZE_LIMITS.ORGANIZATION_LOGO}
                maxWidth={512}
                maxHeight={512}
                placeholder="Upload organization logo (max 512×512px)"
                disabled={isLoading}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Acme Inc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Organization Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="acme-inc"
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be used in your organization URL. Only lowercase
              letters, numbers, and hyphens are allowed.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="A brief description of your organization"
            />
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
