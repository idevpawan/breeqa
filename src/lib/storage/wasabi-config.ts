// Wasabi S3 Configuration
// Wasabi is S3-compatible, so we can use AWS SDK

// Validate required environment variables
const validateCredentials = () => {
  const accessKeyId = process.env.NEXT_PUBLIC_WASABI_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NEXT_PUBLIC_WASABI_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "Wasabi credentials not found. Please set WASABI_ACCESS_KEY_ID and WASABI_SECRET_ACCESS_KEY in your environment variables."
    );
  }

  return { accessKeyId, secretAccessKey };
};

// Validate credentials on module load
const credentials = validateCredentials();

export const wasabiConfig = {
  region: process.env.NEXT_PUBLIC_WASABI_REGION || "us-east-1",
  endpoint:
    process.env.NEXT_PUBLIC_WASABI_ENDPOINT || "https://s3.wasabisys.com",
  credentials: {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
  },
  bucket: process.env.NEXT_PUBLIC_WASABI_BUCKET_NAME || "breeqa-media",
  // Public URL for accessing files
  publicUrl:
    process.env.NEXT_PUBLIC_WASABI_PUBLIC_URL ||
    `https://${
      process.env.NEXT_PUBLIC_WASABI_BUCKET_NAME || "breeqa-media"
    }.s3.wasabisys.com`,
};

// Folder structure constants
export const MEDIA_FOLDERS = {
  USERS: "users",
  ORGANIZATIONS: "organizations",
  TEMP: "temp",
} as const;

// File type validation
export const ALLOWED_FILE_TYPES = {
  IMAGES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ] as string[],
  DOCUMENTS: [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as string[],
  ARCHIVES: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ] as string[],
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  PROFILE_IMAGE: 10 * 1024 * 1024, // 10MB
  ORGANIZATION_LOGO: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
  GENERAL: 100 * 1024 * 1024, // 100MB
} as const;

// Generate file paths
export const generateFilePath = {
  userAvatar: (userId: string, filename: string) =>
    `${MEDIA_FOLDERS.USERS}/${userId}/avatar/${filename}`,

  userProfile: (userId: string, filename: string) =>
    `${MEDIA_FOLDERS.USERS}/${userId}/profile/${filename}`,

  organizationLogo: (orgId: string, filename: string) =>
    `${MEDIA_FOLDERS.ORGANIZATIONS}/${orgId}/logo/${filename}`,

  organizationMedia: (orgId: string, filename: string) =>
    `${MEDIA_FOLDERS.ORGANIZATIONS}/${orgId}/media/${filename}`,

  tempFile: (filename: string) => `${MEDIA_FOLDERS.TEMP}/${filename}`,
};

// Generate public URLs
export const generatePublicUrl = (filePath: string) =>
  `${wasabiConfig.publicUrl}/${filePath}`;

// Validate file type
export const validateFileType = (fileType: string, allowedTypes: string[]) =>
  allowedTypes.includes(fileType);

// Validate file size
export const validateFileSize = (fileSize: number, maxSize: number) =>
  fileSize <= maxSize;

// Generate unique filename
export const generateUniqueFilename = (originalName: string) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `${timestamp}-${randomString}.${extension}`;
};
