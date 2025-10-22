"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { MediaService } from "@/lib/storage/media-service";
import { FILE_SIZE_LIMITS } from "@/lib/storage/wasabi-config";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Check } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onUploadComplete: (avatarUrl: string) => void;
  onUploadError: (error: string) => void;
  className?: string;
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  onUploadComplete,
  onUploadError,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      const uploadResult = await MediaService.uploadUserAvatar(
        userId,
        selectedFile
      );

      if (!uploadResult.success || !uploadResult.publicUrl) {
        throw new Error(uploadResult.error || "Upload failed");
      }

      // Update user profile in database
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ avatar_url: uploadResult.publicUrl })
        .eq("id", userId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setUploadSuccess(true);
      onUploadComplete(uploadResult.publicUrl);

      // Clear selected file after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Avatar upload error:", error);
      onUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Current Avatar Display */}
        {currentAvatarUrl && (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src={currentAvatarUrl}
                alt="Current avatar"
                className="h-16 w-16 rounded-full object-cover"
                width={64}
                height={64}
              />
              {uploadSuccess && (
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Current Avatar</p>
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
          maxSize={FILE_SIZE_LIMITS.AVATAR}
          maxWidth={512}
          maxHeight={512}
          placeholder="Upload avatar image (max 512×512px)"
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
              "Upload Avatar"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
