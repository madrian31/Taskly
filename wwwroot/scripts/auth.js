// auth.js - Combined Authentication Service and Flow
import { auth } from '../../firebaseInit.js';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import UserService from '../../Services/UserService.js';
import PageService from './PageService.js';
import UIService from './UIService.js';
import ModalService from './ModalService.js';
import ErrorHandler from './ErrorHandler.js';
import { STORAGE_KEYS, PAGE_ROUTES, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants.js';

// ==================== AUTH SERVICE ====================

const provider = new GoogleAuthProvider();

class AuthService {
  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      ErrorHandler.success(`User signed in: ${user.email}`, 'AuthService');
      
      // Handle login in database
      await UserService.handleLogin(user);
      
      return user;
    } catch (error) {
      ErrorHandler.handle(error, 'AuthService.signInWithGoogle');
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const user = auth.currentUser;
      
      if (user) {
        await UserService.handleLogout(user.uid);
      }
      
      await signOut(auth);
      sessionStorage.clear();
      
      ErrorHandler.success('User logged out', 'AuthService');
      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'AuthService.signOut');
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return auth.currentUser !== null;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get current user's ID token
   */
  async getIdToken() {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      
      return await user.getIdToken();
    } catch (error) {
      ErrorHandler.handle(error, 'AuthService.getIdToken');
      return null;
    }
  }
}

const authService = new AuthService();

// ==================== GOOGLE LOGIN ====================

// ==================== GOOGLE LOGIN ====================

/**
 * Initialize Google Login button
 */
export function initGoogleLogin() {
  const googleLogin = document.getElementById("google-login-btn");
  
  if (!googleLogin) {
    ErrorHandler.warn('Google login button not found', 'initGoogleLogin');
    return;
  }
  
  googleLogin.addEventListener("click", handleGoogleLogin);
}

/**
 * Handle Google login click
 */
async function handleGoogleLogin() {
  try {
    const user = await authService.signInWithGoogle();
    
    // Check if account is activated
    const isActivated = await UserService.isUserActivated(user.uid);
    
    if (!isActivated) {
      await authService.signOut();
      PageService.navigateToLocked();
      return;
    }
    
    // Set authentication flag
    sessionStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    
    // Redirect to dashboard
    PageService.navigateToDashboard();
  } catch (error) {
    ModalService.showError('Login failed: ' + error.message);
  }
}


// ==================== AUTH STATE MANAGEMENT ====================

/**
 * Initialize authentication state listener
 */
function initAuth() {
  ErrorHandler.debug('Initializing auth state listener', 'initAuth');

  // Show loading initially on protected pages
  if (PageService.isProtectedPage(getCurrentPageName())) {
    PageService.showLoading();
  }

  authService.onAuthStateChanged(async (user) => {
    if (user) {
      ErrorHandler.success(`User signed in: ${user.email}`, 'initAuth');
      
      // Handle login in database
      await UserService.handleLogin(user);
      
      // Only check activation on protected pages, not on login page
      const currentPageName = getCurrentPageName();
      
      if (PageService.isProtectedPage(currentPageName)) {
        // Check if user account is activated
        const isActivated = await UserService.isUserActivated(user.uid);
        
        if (!isActivated) {
          ErrorHandler.warn('Account not activated', 'initAuth');
          PageService.hideLoading();
          PageService.navigateToLocked();
          await authService.signOut();
          return;
        }

        // Initialize page if on protected page
        const success = await PageService.initProtectedPage(user);
        PageService.hideLoading();
        
        if (!success) {
          PageService.redirectToDashboard();
        }
      } else {
        // On non-protected pages (but not login), update UI and menu
        if (!isLoginPage()) {
          try {
            const userData = await UserService.getUserById(user.uid);
            if (userData) {
              UIService.updateUserProfile(userData);
              await UIService.loadMenuByRole(userData.role);
            }
          } catch (err) {
            ErrorHandler.handle(err, 'initAuth.nonProtectedInit');
          }
        }

        // On login page, or after updating non-protected page UI, hide loading
        PageService.hideLoading();
      }

    } else {
      ErrorHandler.debug('User is signed out', 'initAuth');
      
      // Redirect to login if not on login page
      if (!isLoginPage()) {
        PageService.handleUnauthenticated();
      } else {
        PageService.hideLoading();
      }
    }
  });
}

/**
 * Get current page name
 */
function getCurrentPageName() {
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);
  return page.replace('.html', '');
}

/**
 * Check if current page is login page
 */
function isLoginPage() {
  const pathname = window.location.pathname;
  return pathname.includes('index.html') || 
         pathname === '/' ||
         pathname === '';
}


// ==================== LOGOUT ====================

/**
 * Logout function
 */
async function logout() {
  try {
    await authService.signOut();
    PageService.navigateToLogin();
  } catch (error) {
    ModalService.showError('Logout failed: ' + error.message);
  }
}

/**
 * Handle logout with confirmation modal
 */
function handleLogout() {
  ModalService.confirm(
    'Logout Confirmation',
    'Are you sure you want to logout from your account?',
    logout
  );
}

// Make handleLogout available globally for onclick handlers
window.handleLogout = handleLogout;

// Also export logout for programmatic use
export { logout };

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get current user
 */
export function getCurrentUser() {
  return authService.getCurrentUser();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return authService.isAuthenticated();
}

/**
 * Get current user data from database
 */
export async function getCurrentUserData() {
  const user = getCurrentUser();
  if (!user) return null;
  
  return await UserService.getUserById(user.uid);
}

/**
 * Get current user role
 */
export async function getCurrentUserRole() {
  const userData = await getCurrentUserData();
  return userData ? userData.role : null;
}

// ==================== INITIALIZATION ====================

// Initialize auth when script loads
initAuth();
initGoogleLogin();

// Export for use in other modules
export { initAuth, authService as AuthService };