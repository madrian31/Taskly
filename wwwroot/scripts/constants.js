/**
 * Global Constants
 * Centralized configuration and constant values
 */

// ==================== USER ROLES ====================
export const USER_ROLES = {
  ADMINISTRATOR: 'administrator',
  STAFF: 'staff',
  MODERATOR: 'moderator',
  MEMBER: 'member'
};

// ==================== PAGE NAMES ====================
export const PAGES = {
  LOGIN: 'index.html',
  DASHBOARD: 'dashboard.html',
  USERS: 'users.html',
  EVENTS: 'events.html',
  REPORTS: 'reports.html',
  SETTINGS: 'settings.html',
  LOCKED: 'locked.html'
};

// ==================== PAGE ROUTES ====================
export const PAGE_ROUTES = {
  LOGIN: '/',
  DASHBOARD: '/Views/Dashboard/dashboard.html',
  USERS: '/Views/Users/users.html',
  EVENTS: '/Views/Events/events.html',
  REPORTS: '/Views/Reports/reports.html',
  SETTINGS: '/Views/Settings/settings.html',
  LOCKED: '/Views/Auth/locked.html'
};

// ==================== PROTECTED PAGES ====================
export const PROTECTED_PAGES = [
  PAGES.DASHBOARD,
  PAGES.USERS,
  PAGES.EVENTS,
  PAGES.REPORTS,
  PAGES.SETTINGS
];

// ==================== ROLE ACCESS MAPPING ====================
export const ROLE_ACCESS = {
  [PAGES.DASHBOARD]: ['everyone'],
  [PAGES.USERS]: [USER_ROLES.ADMINISTRATOR],
  [PAGES.EVENTS]: ['everyone'],
  [PAGES.REPORTS]: [USER_ROLES.ADMINISTRATOR, USER_ROLES.STAFF, USER_ROLES.MODERATOR],
  [PAGES.SETTINGS]: ['everyone']
};

// ==================== API/STORAGE KEYS ====================
export const STORAGE_KEYS = {
  IS_AUTHENTICATED: 'isAuthenticated',
  CURRENT_USER: 'currentUser'
};

// ==================== DEFAULT VALUES ====================
export const DEFAULTS = {
  ACCOUNT_STATUS: false,
  USER_ROLE: USER_ROLES.MEMBER,
  AVATAR_SIZE: 80,
  AVATAR_BG_COLOR: '#667eea'
};

// ==================== ERROR MESSAGES ====================
export const ERROR_MESSAGES = {
  INVALID_USER: 'Invalid user object',
  USER_ID_REQUIRED: 'User ID is required',
  ACCESS_DENIED: 'Access Denied: Insufficient permissions',
  ADMIN_ONLY: 'Access Denied: This page is for Administrators only.',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact the administrator.',
  LOGIN_FAILED: 'Login failed',
  LOGOUT_FAILED: 'Logout failed',
  LOAD_FAILED: 'Error loading data. Please try again.'
};

// ==================== SUCCESS MESSAGES ====================
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful',
  LOGOUT: 'Logged out successfully',
  USER_ACTIVATED: 'User activated successfully',
  USER_DEACTIVATED: 'User deactivated successfully',
  ROLE_UPDATED: 'User role updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};

// ==================== CONFIRMATION MESSAGES ====================
export const CONFIRMATION_MESSAGES = {
  LOGOUT: 'Are you sure you want to logout from your account?',
  DEACTIVATE_USER: 'Are you sure you want to deactivate this user?',
  ACTIVATE_USER: 'Are you sure you want to activate this user?'
};

// ==================== MODAL TITLES ====================
export const MODAL_TITLES = {
  SUCCESS: 'Success',
  ERROR: 'Error',
  INFO: 'Information',
  CONFIRM: 'Confirmation',
  CHANGE_ROLE: 'Change User Role'
};
