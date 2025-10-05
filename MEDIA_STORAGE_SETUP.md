# Media Storage Setup with Wasabi

This document explains how to set up scalable media storage using Wasabi (S3-compatible) for user profiles and organization files.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Wasabi S3 Configuration
WASABI_REGION=us-east-1
WASABI_ENDPOINT=https://s3.wasabisys.com
WASABI_ACCESS_KEY_ID=your_wasabi_access_key
WASABI_SECRET_ACCESS_KEY=your_wasabi_secret_key
WASABI_BUCKET_NAME=your_bucket_name
WASABI_PUBLIC_URL=https://your_bucket_name.s3.wasabisys.com
```

## Wasabi Setup

1. **Create a Wasabi Account**

   - Go to [wasabi.com](https://wasabi.com)
   - Sign up for an account
   - Choose a region (us-east-1 is recommended)

2. **Create a Bucket**

   - Log into the Wasabi console
   - Create a new bucket (e.g., `breeqa-media`)
   - Enable public read access for the bucket if you want direct file access

3. **Generate Access Keys**

   - Go to Access Keys in the Wasabi console
   - Create a new access key pair
   - Copy the Access Key ID and Secret Access Key

4. **Configure CORS (Optional)**
   - If you need direct browser uploads, configure CORS:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

## Folder Structure

The media storage follows this organized structure:

```
breeqa-media/
├── users/
│   └── {userId}/
│       ├── avatar/
│       │   └── {timestamp}-{random}.{ext}
│       └── profile/
│           └── {timestamp}-{random}.{ext}
├── organizations/
│   └── {organizationId}/
│       ├── logo/
│       │   └── {timestamp}-{random}.{ext}
│       └── media/
│           └── {timestamp}-{random}.{ext}
└── temp/
    └── {timestamp}-{random}.{ext}
```

## File Type Support

### Images

- **Types**: JPEG, PNG, GIF, WebP, SVG
- **User Avatar**: Max 5MB, 512×512px
- **User Profile**: Max 10MB
- **Organization Logo**: Max 5MB, 512×512px

### Documents

- **Types**: PDF, TXT, DOC, DOCX
- **Max Size**: 50MB

### Archives

- **Types**: ZIP, RAR, 7Z
- **Max Size**: 100MB

## Usage Examples

### Upload User Avatar

```typescript
import { MediaService } from "@/lib/storage/media-service";

const result = await MediaService.uploadUserAvatar(userId, file);
if (result.success) {
  console.log("Avatar URL:", result.publicUrl);
}
```

### Upload Organization Logo

```typescript
const result = await MediaService.uploadOrganizationLogo(orgId, file);
if (result.success) {
  console.log("Logo URL:", result.publicUrl);
}
```

### Upload General Media

```typescript
const result = await MediaService.uploadOrganizationMedia(orgId, file);
if (result.success) {
  console.log("Media URL:", result.publicUrl);
}
```

## Components

### FileUpload Component

A reusable file upload component with drag-and-drop support:

```tsx
import { FileUpload } from "@/components/ui/file-upload";

<FileUpload
  onFileSelect={handleFileSelect}
  accept="image/*"
  maxSize={5 * 1024 * 1024} // 5MB
  maxWidth={512}
  maxHeight={512}
  placeholder="Upload avatar image"
/>;
```

### AvatarUpload Component

Specialized component for user avatar uploads:

```tsx
import { AvatarUpload } from "@/components/media/avatar-upload";

<AvatarUpload
  userId={userId}
  currentAvatarUrl={user.avatar_url}
  onUploadComplete={handleUploadComplete}
  onUploadError={handleUploadError}
/>;
```

### OrganizationLogoUpload Component

Specialized component for organization logo uploads:

```tsx
import { OrganizationLogoUpload } from "@/components/media/organization-logo-upload";

<OrganizationLogoUpload
  organizationId={orgId}
  currentLogoUrl={org.logo_url}
  onUploadComplete={handleUploadComplete}
  onUploadError={handleUploadError}
/>;
```

## Security Considerations

1. **File Validation**: All files are validated for type and size before upload
2. **Unique Filenames**: Files are renamed with timestamps and random strings
3. **Access Control**: Files are organized by user/organization for easy access control
4. **Metadata**: File metadata includes upload time and user/organization IDs

## Cost Optimization

1. **File Cleanup**: Implement cleanup for temporary files
2. **Image Optimization**: Consider adding image compression before upload
3. **CDN**: Consider using a CDN for faster global access
4. **Lifecycle Policies**: Set up Wasabi lifecycle policies for old files

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure CORS is properly configured in Wasabi
2. **Permission Denied**: Check that your access keys have the correct permissions
3. **File Not Found**: Verify the bucket name and region are correct
4. **Upload Fails**: Check file size and type restrictions

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will log detailed information about uploads and errors.
