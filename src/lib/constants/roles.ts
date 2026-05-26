export const ROLES = {
  VISITOR: "visitor",
  TRIAL: "trial",
  MEMBER: "member",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy — higher index = more permissions.
 */
export const ROLE_HIERARCHY: Role[] = [
  ROLES.VISITOR,
  ROLES.TRIAL,
  ROLES.MEMBER,
  ROLES.INSTRUCTOR,
  ROLES.ADMIN,
];

/**
 * Check if a role has at least the specified minimum role level.
 */
export function hasMinimumRole(userRole: Role, minimumRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(minimumRole);
  return userLevel >= requiredLevel;
}
