"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useOrganization } from "@/lib/contexts/organization-context";
import { OrganizationLogoUpload } from "@/components/media/organization-logo-upload";
import { FileUpload } from "@/components/ui/file-upload";
import { MediaService } from "@/lib/storage/media-service";
import {
  FILE_SIZE_LIMITS,
  ALLOWED_FILE_TYPES,
} from "@/lib/storage/wasabi-config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Trash2, Download, Image, File } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export default function MediaSettingsPage() {
  const { currentOrganization, userRole } = useOrganization();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  // Check if user has permission to manage media
  const canManageMedia = userRole === "admin" || userRole === "manager";

  const loadMediaFiles = async () => {
    if (!currentOrganization) return;

    setIsLoading(true);
    try {
      // In a real implementation, you would query your database for media files
      // For now, we'll simulate loading files
      setMediaFiles([]);
    } catch (error) {
      console.error("Error loading media files:", error);
      setError("Failed to load media files");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrganization) {
      loadMediaFiles();
    }
  }, [currentOrganization]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentOrganization) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await MediaService.uploadOrganizationMedia(
        currentOrganization.id,
        selectedFile
      );

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setSuccess("File uploaded successfully");
      setSelectedFile(null);
      await loadMediaFiles();
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      // In a real implementation, you would delete from database and storage
      setMediaFiles((prev) => prev.filter((file) => file.id !== fileId));
      setSuccess("File deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete file");
    }
  };

  const handleLogoUploadComplete = (logoUrl: string) => {
    setSuccess("Organization logo updated successfully");
  };

  const handleLogoUploadError = (error: string) => {
    setError(error);
  };

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Organization Selected
          </h3>
          <p className="text-muted-foreground">
            Please select an organization to manage media files.
          </p>
        </div>
      </div>
    );
  }

  if (!canManageMedia) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Access Denied
          </h3>
          <p className="text-muted-foreground">
            You don't have permission to manage media files.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Media Management</h1>
        <p className="text-muted-foreground">
          Manage your organization's media files and logo.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Organization Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Logo</CardTitle>
          <CardDescription>
            Upload and manage your organization's logo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationLogoUpload
            organizationId={currentOrganization.id}
            currentLogoUrl={currentOrganization.logo_url}
            onUploadComplete={handleLogoUploadComplete}
            onUploadError={handleLogoUploadError}
          />
        </CardContent>
      </Card>

      {/* Media Files Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Media Files</CardTitle>
          <CardDescription>
            Upload images, documents, and other media files for your
            organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            accept={[
              ...ALLOWED_FILE_TYPES.IMAGES,
              ...ALLOWED_FILE_TYPES.DOCUMENTS,
            ].join(",")}
            maxSize={FILE_SIZE_LIMITS.GENERAL}
            placeholder="Upload media files (images, documents, etc.)"
            disabled={isUploading}
          />

          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Media Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Media Files</CardTitle>
          <CardDescription>
            Manage your organization's uploaded media files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No media files uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaFiles.map((file) => (
                <div
                  key={file.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {file.type.startsWith("image/") ? (
                        <Image className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <File className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
