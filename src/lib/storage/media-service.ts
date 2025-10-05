import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  wasabiConfig,
  generateFilePath,
  generatePublicUrl,
  generateUniqueFilename,
  validateFileType,
  validateFileSize,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS,
  MEDIA_FOLDERS,
} from "./wasabi-config";

// Initialize S3 client with error handling
let s3Client: S3Client;

try {
  s3Client = new S3Client({
    region: wasabiConfig.region,
    endpoint: wasabiConfig.endpoint,
    credentials: wasabiConfig.credentials,
  });
} catch (error) {
  console.error("Failed to initialize S3 client:", error);
  throw new Error(
    "Failed to initialize media storage. Please check your Wasabi credentials."
  );
}

export interface UploadResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

export interface FileUploadOptions {
  file: File;
  userId?: string;
  organizationId?: string;
  folder: "avatar" | "profile" | "logo" | "media" | "temp";
  allowedTypes?: string[];
  maxSize?: number;
}

export class MediaService {
  // Upload file to Wasabi
  static async uploadFile(options: FileUploadOptions): Promise<UploadResult> {
    try {
      const { file, userId, organizationId, folder, allowedTypes, maxSize } =
        options;

      // Validate file type
      if (allowedTypes && !validateFileType(file.type, allowedTypes)) {
        return {
          success: false,
          error: `File type ${
            file.type
          } is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
        };
      }

      // Validate file size
      if (maxSize && !validateFileSize(file.size, maxSize)) {
        return {
          success: false,
          error: `File size ${file.size} exceeds maximum allowed size ${maxSize} bytes`,
        };
      }

      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(file.name);

      // Generate file path based on folder type
      let filePath: string;
      if (folder === "avatar" && userId) {
        filePath = generateFilePath.userAvatar(userId, uniqueFilename);
      } else if (folder === "profile" && userId) {
        filePath = generateFilePath.userProfile(userId, uniqueFilename);
      } else if (folder === "logo" && organizationId) {
        filePath = generateFilePath.organizationLogo(
          organizationId,
          uniqueFilename
        );
      } else if (folder === "media" && organizationId) {
        filePath = generateFilePath.organizationMedia(
          organizationId,
          uniqueFilename
        );
      } else if (folder === "temp") {
        filePath = generateFilePath.tempFile(uniqueFilename);
      } else {
        return {
          success: false,
          error: "Invalid folder type or missing required IDs",
        };
      }

      // Convert file to buffer
      const fileBuffer = await file.arrayBuffer();

      // Upload to Wasabi
      const command = new PutObjectCommand({
        Bucket: wasabiConfig.bucket,
        Key: filePath,
        Body: Buffer.from(fileBuffer),
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          userId: userId || "",
          organizationId: organizationId || "",
        },
      });

      try {
        await s3Client.send(command);
      } catch (s3Error: any) {
        console.error("S3 upload error:", s3Error);

        // Provide more specific error messages
        if (s3Error.name === "InvalidAccessKeyId") {
          throw new Error(
            "Invalid Wasabi access key. Please check your WASABI_ACCESS_KEY_ID."
          );
        } else if (s3Error.name === "SignatureDoesNotMatch") {
          throw new Error(
            "Invalid Wasabi secret key. Please check your WASABI_SECRET_ACCESS_KEY."
          );
        } else if (s3Error.name === "NoSuchBucket") {
          throw new Error(
            `Wasabi bucket '${wasabiConfig.bucket}' not found. Please check your WASABI_BUCKET_NAME.`
          );
        } else if (s3Error.name === "AccessDenied") {
          throw new Error(
            "Access denied to Wasabi bucket. Please check your credentials and bucket permissions."
          );
        } else {
          throw new Error(
            `Wasabi upload failed: ${s3Error.message || "Unknown error"}`
          );
        }
      }

      const publicUrl = generatePublicUrl(filePath);

      return {
        success: true,
        filePath,
        publicUrl,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Delete file from Wasabi
  static async deleteFile(filePath: string): Promise<UploadResult> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: wasabiConfig.bucket,
        Key: filePath,
      });

      await s3Client.send(command);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting file:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Generate presigned URL for direct uploads (client-side)
  static async generatePresignedUploadUrl(
    filePath: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<{ success: boolean; uploadUrl?: string; error?: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: wasabiConfig.bucket,
        Key: filePath,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

      return {
        success: true,
        uploadUrl,
      };
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Generate presigned URL for downloads
  static async generatePresignedDownloadUrl(
    filePath: string,
    expiresIn: number = 3600
  ): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: wasabiConfig.bucket,
        Key: filePath,
      });

      const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn });

      return {
        success: true,
        downloadUrl,
      };
    } catch (error) {
      console.error("Error generating download URL:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Upload user avatar
  static async uploadUserAvatar(
    userId: string,
    file: File
  ): Promise<UploadResult> {
    return this.uploadFile({
      file,
      userId,
      folder: "avatar",
      allowedTypes: ALLOWED_FILE_TYPES.IMAGES,
      maxSize: FILE_SIZE_LIMITS.AVATAR,
    });
  }

  // Upload user profile image
  static async uploadUserProfile(
    userId: string,
    file: File
  ): Promise<UploadResult> {
    return this.uploadFile({
      file,
      userId,
      folder: "profile",
      allowedTypes: ALLOWED_FILE_TYPES.IMAGES,
      maxSize: FILE_SIZE_LIMITS.PROFILE_IMAGE,
    });
  }

  // Upload organization logo
  static async uploadOrganizationLogo(
    organizationId: string,
    file: File
  ): Promise<UploadResult> {
    return this.uploadFile({
      file,
      organizationId,
      folder: "logo",
      allowedTypes: ALLOWED_FILE_TYPES.IMAGES,
      maxSize: FILE_SIZE_LIMITS.ORGANIZATION_LOGO,
    });
  }

  // Upload organization media
  static async uploadOrganizationMedia(
    organizationId: string,
    file: File
  ): Promise<UploadResult> {
    return this.uploadFile({
      file,
      organizationId,
      folder: "media",
      allowedTypes: [
        ...ALLOWED_FILE_TYPES.IMAGES,
        ...ALLOWED_FILE_TYPES.DOCUMENTS,
      ],
      maxSize: FILE_SIZE_LIMITS.GENERAL,
    });
  }

  // Upload temporary file
  static async uploadTempFile(file: File): Promise<UploadResult> {
    return this.uploadFile({
      file,
      folder: "temp",
      allowedTypes: [
        ...ALLOWED_FILE_TYPES.IMAGES,
        ...ALLOWED_FILE_TYPES.DOCUMENTS,
        ...ALLOWED_FILE_TYPES.ARCHIVES,
      ],
      maxSize: FILE_SIZE_LIMITS.GENERAL,
    });
  }
}

// Utility functions for common operations
export const MediaUtils = {
  // Get file extension
  getFileExtension: (filename: string) =>
    filename.split(".").pop()?.toLowerCase(),

  // Check if file is image
  isImage: (fileType: string) => fileType.startsWith("image/"),

  // Check if file is document
  isDocument: (fileType: string) =>
    fileType.startsWith("application/") || fileType.startsWith("text/"),

  // Format file size
  formatFileSize: (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Validate image dimensions (for client-side validation)
  validateImageDimensions: (
    file: File,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const valid =
          (!maxWidth || img.width <= maxWidth) &&
          (!maxHeight || img.height <= maxHeight);
        resolve(valid);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  },
};
