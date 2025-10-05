"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { MediaService } from "@/lib/storage/media-service";
import { FILE_SIZE_LIMITS } from "@/lib/storage/wasabi-config";
import { useOrganization } from "@/lib/contexts/organization-context";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Check } from "lucide-react";

interface OrganizationLogoUploadProps {
  organizationId: string;
  currentLogoUrl?: string;
  onUploadComplete: (logoUrl: string) => void;
  onUploadError: (error: string) => void;
  className?: string;
}

export function OrganizationLogoUpload({
  organizationId,
  currentLogoUrl,
  onUploadComplete,
  onUploadError,
  className,
}: OrganizationLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { refreshOrganizations } = useOrganization();
  const supabase = createClient();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadSuccess(false);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // Upload file to Wasabi
      const uploadResult = await MediaService.uploadOrganizationLogo(
        organizationId,
        selectedFile
      );

      if (!uploadResult.success || !uploadResult.publicUrl) {
        throw new Error(uploadResult.error || "Upload failed");
      }

      // Update organization in database
      const { error: updateError } = await supabase
        .from("organizations")
        .update({ logo_url: uploadResult.publicUrl })
        .eq("id", organizationId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setUploadSuccess(true);
      onUploadComplete(uploadResult.publicUrl);

      // Refresh organization context
      await refreshOrganizations();

      // Clear selected file after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Organization logo upload error:", error);
      onUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Current Logo Display */}
        {currentLogoUrl && (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={currentLogoUrl}
                alt="Organization logo"
                className="h-16 w-16 rounded-lg object-cover"
              />
              {uploadSuccess && (
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Current Logo</p>
              <p className="text-xs text-muted-foreground">
                Click below to upload a new one
              </p>
            </div>
          </div>
        )}

        {/* File Upload */}
        <FileUpload
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          accept="image/*"
          maxSize={FILE_SIZE_LIMITS.ORGANIZATION_LOGO}
          maxWidth={512}
          maxHeight={512}
          placeholder="Upload organization logo (max 512×512px)"
          disabled={isUploading}
        />

        {/* Upload Button */}
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
              "Upload Logo"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
