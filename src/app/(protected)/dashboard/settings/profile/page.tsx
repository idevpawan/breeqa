"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { AvatarUpload } from "@/components/media/avatar-upload";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserStore } from "@/lib/stores/user-store";
import { Loader2, Save, User } from "lucide-react";

export default function ProfileSettingsPage() {
  const { userProfile, isLoading, updateProfile, refreshProfile } =
    useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    timezone: "UTC",
  });

  // Update form data when user profile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        timezone: userProfile.timezone || "UTC",
      });
    }
  }, [userProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({
        full_name: formData.full_name,
        timezone: formData.timezone,
      });

      setSuccess("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUploadComplete = async (avatarUrl: string) => {
    try {
      await updateProfile({ avatar_url: avatarUrl });
      setSuccess("Avatar updated successfully");
    } catch (error) {
      setError("Failed to update avatar");
    }
  };

  const handleAvatarUploadError = (error: string) => {
    setError(error);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Profile Not Found
          </h3>
          <p className="text-muted-foreground">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal profile information and avatar.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload and manage your profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              userId={userProfile.id}
              currentAvatarUrl={userProfile.avatar_url}
              onUploadComplete={handleAvatarUploadComplete}
              onUploadError={handleAvatarUploadError}
            />
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                </select>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and membership information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {userProfile.id}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-sm">
                {new Date(userProfile.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Last Updated</Label>
              <p className="text-sm">
                {new Date(userProfile.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Current Timezone</Label>
              <p className="text-sm">{userProfile.timezone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
