/**
 * Utility Service
 * Shared utility functions for common operations
 */

/**
 * Format date - Progressive time display
 * - Less than 24 hours: minutes/hours
 * - 1-6 days: "1 day ago", "2 days ago"
 * - 7-29 days: "1 week ago", "2 weeks ago"
 * - 30+ days but same year: "1 month ago", "2 months ago"
 * - Different year or 12+ months: "Dec 25, 2024"
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  // Less than 1 minute
  if (diffMins < 1) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diffHours < 1) {
    return `${diffMins}m ago`;
  }

  // Less than 24 hours
  if (diffDays < 1) {
    return `${diffHours}h ago`;
  }

  // Less than 7 days
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  // Less than 30 days
  if (diffDays < 30) {
    return `${diffWeeks}w ago`;
  }

  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Different year
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Get role badge CSS class
 */
export function getRoleBadgeClass(role) {
  const badgeClasses = {
    'administrator': 'role-administrator',
    'staff': 'role-staff',
    'moderator': 'role-moderator',
    'member': 'role-member'
  };

  return badgeClasses[role] || 'role-member';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role) {
  const displayNames = {
    'administrator': 'Administrator',
    'staff': 'Staff',
    'moderator': 'Moderator',
    'member': 'Member'
  };

  return displayNames[role] || 'Member';
}

/**
 * Get avatar URL with fallback
 */
export function getAvatarUrl(photoURL, name, size = 80, bgColor = '#667eea') {
  if (photoURL) return photoURL;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${bgColor.replace('#', '')}&color=fff&size=${size}`;
}

/**
 * Get current page name from URL
 */
export function getCurrentPageName() {
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);
  return page.replace('.html', '') || 'index';
}

/**
 * Check if current page is login page
 */
export function isLoginPage() {
  const pathname = window.location.pathname;
  return pathname.includes('index.html') || 
         pathname === '/' ||
         pathname === '';
}

/**
 * Check if current page is protected (requires authentication)
 */
export function isProtectedPage() {
  const { PROTECTED_PAGES } = require('./constants.js');
  const currentPage = window.location.pathname.substring(
    window.location.pathname.lastIndexOf('/') + 1
  );
  
  return PROTECTED_PAGES.includes(currentPage);
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate user data
 */
export function validateUserData(userData) {
  const errors = [];

  if (!userData.name || userData.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('Valid email is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Debounce function for search/filter operations
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
