/**
 * Role constants để dùng nhất quán trong toàn bộ app
 */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  BUYER: "buyer",
  STAFF: "staff",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Check xem role có phải admin không
 */
export const isAdminRole = (roles: string[] | undefined | null): boolean => {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.includes(ROLES.ADMIN);
};

/**
 * Check xem role có phải user thường không
 */
export const isUserRole = (roles: string[] | undefined | null): boolean => {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.includes(ROLES.USER) || roles.includes(ROLES.BUYER);
};

/**
 * Check xem role có phải staff không
 */
export const isStaffRole = (roles: string[] | undefined | null): boolean => {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.includes(ROLES.STAFF);
};

