import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/stores/index";
import { logout } from "@/stores/auth/action";
import { ROLES, isAdminRole, isUserRole, isStaffRole } from "@/constants/roles";

/**
 * Custom hook để check authentication status từ Redux store
 * Thay thế cho useAuth từ AuthContext
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  // Check authentication status
  const isAuthenticated = !!user;

  // Get user roles (default to empty array)
  const userRoles = user?.roles || [];

  // Check admin role
  const isAdmin = isAdminRole(userRoles);

  // Check user role (regular user/buyer)
  const isUser = isUserRole(userRoles);

  // Check staff role
  const isStaff = isStaffRole(userRoles);

  // Get primary role (first role in array, or 'user' as default)
  const primaryRole = userRoles.length > 0 ? userRoles[0] : null;

  // Check specific role
  const hasRole = (role: string) => {
    return userRoles.includes(role);
  };

  // Check multiple roles (at least one)
  const hasAnyRole = (roles: string[]) => {
    return roles.some(role => userRoles.includes(role));
  };

  // Check all roles (must have all)
  const hasAllRoles = (roles: string[]) => {
    return roles.every(role => userRoles.includes(role));
  };

  // Check specific permission
  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };

  // Check multiple permissions (at least one)
  const hasAnyPermission = (permissions: string[]) => {
    if (!user?.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  // Check all permissions (must have all)
  const hasAllPermissions = (permissions: string[]) => {
    if (!user?.permissions) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  };

  // Logout function
  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    isLoading: loading,
    error,
    // Role checks
    isAdmin,
    isUser,
    isStaff,
    primaryRole,
    userRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    // Actions
    logout: handleLogout,
  };
};

