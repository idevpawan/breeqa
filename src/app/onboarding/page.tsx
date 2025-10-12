"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { ThemeToggle } from "@/components/theme-toggle";
import { organizationServiceClient } from "@/lib/services/organization-client";
import { MediaService } from "@/lib/storage/media-service";
import { FILE_SIZE_LIMITS } from "@/lib/storage/wasabi-config";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

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

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Organization creation error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  B
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">BREEQA</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to BREEQA!
            </h1>
            <p className="text-lg text-muted-foreground">
              Let&apos;s get you set up with your first organization to start
              managing projects and issues.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Your Organization</CardTitle>
              <CardDescription>
                Every user needs to be part of an organization to access the
                dashboard. You&apos;ll be the admin of this organization and can
                invite team members later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

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
                        <p className="text-sm font-medium">
                          {selectedLogo?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedLogo?.size || 0) / 1024 / 1024 < 1
                            ? `${((selectedLogo?.size || 0) / 1024).toFixed(
                                1
                              )} KB`
                            : `${(
                                (selectedLogo?.size || 0) /
                                1024 /
                                1024
                              ).toFixed(1)} MB`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleLogoRemove}
                        className="h-8 w-8 p-0"
                        disabled={isLoading}
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
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Acme Inc."
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be the display name for your organization.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Organization Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    type="text"
                    placeholder="acme-inc"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be used in URLs and must be unique. Only lowercase
                    letters, numbers, and hyphens allowed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="A brief description of your organization..."
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    By creating an organization, you agree to our{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Organization"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
                  <span>Admin Access</span>
                </CardTitle>
                <CardDescription>
                  As the creator, you&apos;ll have full admin access to manage
                  your organization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                  <span>Team Invitations</span>
                </CardTitle>
                <CardDescription>
                  Invite team members with different roles: developers,
                  designers, QA, managers, and viewers.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
