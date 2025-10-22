import {
  PERMISSIONS,
  ROLE_HIERARCHY,
  UserRole,
} from "@/lib/types/organization";

export function hasPermission(
  userRole: UserRole | null,
  permission: string
): boolean {
  if (!userRole) return false;
  const permissionConfig = PERMISSIONS[permission];
  if (!permissionConfig) return false;
  return permissionConfig.roles.includes(userRole);
}

export function canManageRole(
  userRole: UserRole,
  targetRole: UserRole
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  return userLevel > targetLevel;
}
