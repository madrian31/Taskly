/**
 * Page Service
 * Handles page initialization and navigation logic
 */

import UserService from '../../Services/UserService.js';
import ErrorHandler from './ErrorHandler.js';
import UIService from './UIService.js';
import { PAGE_ROUTES, PAGES, ROLE_ACCESS, PROTECTED_PAGES } from './constants.js';
import { getCurrentPageName, isLoginPage } from './UtilsService.js';

class PageService {
  /**
   * Initialize protected page
   */
  async initProtectedPage(user) {
    const currentPage = getCurrentPageName();
    console.log(`📄 Initializing page: ${currentPage}`);

    try {
      // Get full user data from database
      const userData = await UserService.getUserById(user.uid);
      
      if (!userData) {
        ErrorHandler.warn('User data not found in database', 'PageService');
        return false;
      }

      // Check access
      const hasAccess = await this.checkPageAccess(currentPage, userData.role);
      if (!hasAccess) {
        this.redirectToDashboard();
        return false;
      }

      // Update UI with user information
      UIService.updateUserProfile(userData);

      // Load menu based on user role
      await UIService.loadMenuByRole(userData.role);

      // Call page-specific initialization
      await this.initPageSpecific(currentPage, userData);

      ErrorHandler.success(`Page initialized: ${currentPage}`, 'PageService');
      return true;

    } catch (error) {
      ErrorHandler.handle(error, 'PageService.initProtectedPage');
      return false;
    }
  }

  /**
   * Check if user has access to current page
   */
  async checkPageAccess(pageName, userRole) {
    const allowedRoles = ROLE_ACCESS[`${pageName}.html`] || [];

    // If page allows 'everyone', grant access
    if (allowedRoles.includes('everyone')) {
      return true;
    }

    // Check if user's role is in allowed roles
    const hasAccess = allowedRoles.includes(userRole);

    if (!hasAccess) {
      ErrorHandler.warn(`Access denied for page: ${pageName}, role: ${userRole}`, 'PageService');
    }

    return hasAccess;
  }

  /**
   * Initialize page-specific functionality
   */
  async initPageSpecific(pageName, userData) {
    ErrorHandler.debug(`Running page-specific init for: ${pageName}`, 'PageService');

    switch(pageName) {
      case 'dashboard':
        if (typeof window.initDashboardContent === 'function') {
          await window.initDashboardContent(userData);
        }
        break;

      case 'users':
        if (typeof window.loadUsers === 'function') {
          await window.loadUsers();
        } else {
          ErrorHandler.warn('loadUsers function not found', 'PageService');
        }
        break;

      case 'events':
        if (typeof window.loadEvents === 'function') {
          await window.loadEvents();
        } else {
          ErrorHandler.warn('loadEvents function not found', 'PageService');
        }
        break;

      case 'reports':
        if (typeof window.loadReports === 'function') {
          await window.loadReports(userData);
        }
        break;

      case 'settings':
        if (typeof window.loadSettings === 'function') {
          await window.loadSettings(userData);
        }
        break;

      default:
        ErrorHandler.debug(`No specific initialization for page: ${pageName}`, 'PageService');
    }
  }

  /**
   * Navigate to login page
   */
  navigateToLogin() {
    window.location.href = PAGE_ROUTES.LOGIN;
  }

  /**
   * Navigate to dashboard
   */
  navigateToDashboard() {
    window.location.href = PAGE_ROUTES.DASHBOARD;
  }

  /**
   * Navigate to locked page
   */
  navigateToLocked() {
    window.location.href = PAGE_ROUTES.LOCKED;
  }

  /**
   * Redirect to dashboard
   */
  redirectToDashboard() {
    console.log('🔀 Redirecting to dashboard');
    window.location.href = PAGE_ROUTES.DASHBOARD;
  }

  /**
   * Handle unauthenticated access
   */
  handleUnauthenticated() {
    if (!isLoginPage()) {
      this.navigateToLogin();
    }
  }

  /**
   * Handle deactivated account
   */
  async handleDeactivatedAccount() {
    this.navigateToLocked();
  }

  /**
   * Show loading state
   */
  showLoading() {
    UIService.showLoading();
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    UIService.hideLoading();
  }

  /**
   * Get protected pages list
   */
  getProtectedPages() {
    return PROTECTED_PAGES;
  }

  /**
   * Check if page is protected
   */
  isProtectedPage(pageName) {
    return PROTECTED_PAGES.includes(`${pageName}.html`);
  }
}

export default new PageService();
