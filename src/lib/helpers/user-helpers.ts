import { UserProfile } from "@/lib/types/organization";

export function getUserDisplayName(userProfile: UserProfile | null): string {
  if (!userProfile) return "User";
  return userProfile.full_name || userProfile.email.split("@")[0];
}

export function getUserInitials(userProfile: UserProfile | null): string {
  if (!userProfile) return "U";
  const displayName = userProfile.full_name || userProfile.email.split("@")[0];
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getUserAvatar(userProfile: UserProfile | null) {
  return {
    avatarUrl: userProfile?.avatar_url,
    initials: getUserInitials(userProfile),
  };
}
