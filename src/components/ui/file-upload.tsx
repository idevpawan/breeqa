"use client";

import * as React from "react";
import { Upload, X, File, Image, AlertCircle, CameraIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MediaUtils } from "@/lib/storage/media-service";

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  accept?: string;
  maxSize?: number;
  maxWidth?: number;
  maxHeight?: number;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  error?: string;
  onError?: (error: string) => void;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = "image/*",
  maxSize,
  maxWidth,
  maxHeight,
  disabled = false,
  className,
  placeholder = "Click to upload or drag and drop",
  error,
  onError,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setValidationError(null);

    // Validate file size
    if (maxSize && file.size > maxSize) {
      setValidationError(
        `File size must be less than ${MediaUtils.formatFileSize(maxSize)}`
      );
      onError?.(
        `File size must be less than ${MediaUtils.formatFileSize(maxSize)}`
      );
      return;
    }

    // Validate image dimensions
    if (MediaUtils.isImage(file.type) && (maxWidth || maxHeight)) {
      const isValidDimensions = await MediaUtils.validateImageDimensions(
        file,
        maxWidth,
        maxHeight
      );
      if (!isValidDimensions) {
        setValidationError(
          `Image dimensions must be ${maxWidth ? `≤ ${maxWidth}px wide` : ""}${
            maxWidth && maxHeight ? " and " : ""
          }${maxHeight ? `≤ ${maxHeight}px tall` : ""}`
        );
        onError?.(
          `Image dimensions must be ${maxWidth ? `≤ ${maxWidth}px wide` : ""}${
            maxWidth && maxHeight ? " and " : ""
          }${maxHeight ? `≤ ${maxHeight}px tall` : ""}`
        );
        return;
      }
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFileRemove) {
      onFileRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayError = error || validationError;

  return (
    <div>
      <div className={cn("w-32 h-32", className)}>
        <div
          className={cn(
            "relative border-2 border-dashed p-4 rounded-full transition-colors cursor-pointer w-32 h-32",
            isDragOver && !disabled && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
            displayError && "border-destructive",
            !displayError &&
              !disabled &&
              "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="text-center flex items-center justify-center mx-auto h-full">
            <CameraIcon className="h-8 w-8 text-muted-foreground " />
          </div>
        </div>
      </div>
    </div>
  );
}
