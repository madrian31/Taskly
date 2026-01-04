/**
 * UI Service
 * Handles all UI-related operations and updates
 */

import UserService from '../../Services/UserService.js';
import ErrorHandler from './ErrorHandler.js';
import { getAvatarUrl } from './UtilsService.js';

class UIService {
  /**
   * Update user profile display in sidebar
   */
  updateUserProfile(userData) {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userPhotoEl = document.getElementById('userPhoto');

    if (userNameEl) {
      userNameEl.textContent = userData.name || 'User';
    }

    if (userEmailEl) {
      userEmailEl.textContent = userData.email || 'No Email';
    }

    if (userPhotoEl) {
      const photoURL = getAvatarUrl(userData.photoURL, userData.name);
      userPhotoEl.src = photoURL;
      userPhotoEl.onerror = function() {
        this.src = getAvatarUrl(null, userData.name);
      };
    }

    ErrorHandler.success('User profile updated', 'UIService');
  }

  /**
   * Load and render menu items based on user role
   */
  async loadMenuByRole(userRole) {
    ErrorHandler.debug(`Loading menu for role: ${userRole}`, 'UIService');

    try {
      // Check if menuConfig exists (from MenuServices.js)
      if (typeof menuConfig === 'undefined') {
        ErrorHandler.warn('menuConfig not found. Make sure MenuServices.js is loaded.', 'UIService');
        return;
      }

      // Check if hasMenuAccess function exists
      if (typeof hasMenuAccess === 'undefined') {
        ErrorHandler.warn('hasMenuAccess function not found.', 'UIService');
        return;
      }

      const sidebarMenu = document.getElementById('sidebarMenu');
      if (!sidebarMenu) {
        ErrorHandler.warn('Sidebar menu element not found', 'UIService');
        return;
      }

      // Clear existing menu
      sidebarMenu.innerHTML = '';

      // Filter and sort menu items
      const accessibleMenuItems = menuConfig
        .filter(item => hasMenuAccess(item, userRole))
        .sort((a, b) => a.sortOrder - b.sortOrder);

      // Render menu items
      accessibleMenuItems.forEach(item => {
        if (typeof window.createMenuItem === 'function') {
          const menuItem = window.createMenuItem(item);
          sidebarMenu.appendChild(menuItem);
        } else {
          ErrorHandler.warn('createMenuItem function not found. Make sure sidebar.js is loaded.', 'UIService');
        }
      });

      ErrorHandler.info(`Loaded ${accessibleMenuItems.length} menu items`, 'UIService');
    } catch (error) {
      ErrorHandler.handle(error, 'UIService.loadMenuByRole');
    }
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (userName) userName.textContent = 'Loading...';
    if (userEmail) userEmail.textContent = 'Please wait...';
    
    ErrorHandler.debug('Loading indicator shown', 'UIService');
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    ErrorHandler.debug('Loading indicator hidden', 'UIService');
  }

  /**
   * Display a message banner
   */
  showMessage(message, type = 'info') {
    const className = `message-${type}`;
    const icon = this.getMessageIcon(type);
    
    const messageEl = document.createElement('div');
    messageEl.className = `message-banner ${className}`;
    messageEl.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${message}</span>
    `;

    document.body.insertBefore(messageEl, document.body.firstChild);

    setTimeout(() => messageEl.remove(), 5000);
  }

  /**
   * Get icon class for message type
   */
  getMessageIcon(type) {
    const icons = {
      'success': 'fa-check-circle',
      'error': 'fa-exclamation-circle',
      'warning': 'fa-exclamation-triangle',
      'info': 'fa-info-circle'
    };

    return icons[type] || icons['info'];
  }

  /**
   * Update user role in sidebar
   */
  updateUserRoleDisplay(role) {
    const userRoleEl = document.getElementById('userRole');
    if (userRoleEl) {
      const displayName = this.getRoleDisplayName(role);
      userRoleEl.textContent = displayName;
    }
  }

  /**
   * Enable/disable element
   */
  setElementDisabled(elementId, disabled = true) {
    const element = document.getElementById(elementId);
    if (element) {
      element.disabled = disabled;
      if (disabled) {
        element.classList.add('disabled');
      } else {
        element.classList.remove('disabled');
      }
    }
  }

  /**
   * Show/hide element
   */
  setElementVisible(elementId, visible = true) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Scroll to element
   */
  scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Set form values
   */
  setFormValues(formId, values) {
    const form = document.getElementById(formId);
    if (!form) return;

    Object.keys(values).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = values[key];
      }
    });
  }

  /**
   * Get form values
   */
  getFormValues(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const formData = new FormData(form);
    const values = {};

    formData.forEach((value, key) => {
      values[key] = value;
    });

    return values;
  }

  /**
   * Clear form
   */
  clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  }
}

export default new UIService();