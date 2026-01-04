// users.js - User Management Page (refactored with SoC)
import UserService from '../../Services/UserService.js';
import { getCurrentUser, getCurrentUserData } from './auth.js';
import ErrorHandler from './ErrorHandler.js';
import ModalService from './ModalService.js';
import UIService from './UIService.js';
import { 
  formatDate, 
  getRoleBadgeClass, 
  getRoleDisplayName, 
  getAvatarUrl 
} from './UtilsService.js';

// ==================== LOAD USERS ====================

async function loadUsers() {
  ErrorHandler.debug('Loading users...', 'loadUsers');
  const tableContent = document.getElementById('tableContent');
  if (tableContent) {
    const tpl = document.getElementById('tpl-loading');
    tableContent.innerHTML = '';
    tableContent.appendChild(tpl.content.cloneNode(true));
  }

  try {
    const users = await UserService.getAllUsers();
    // cache users for filtering
    window.__usersCache = users || [];
    applyFilters();
  } catch (error) {
    ErrorHandler.handle(error, 'loadUsers');
    const tpl = document.getElementById('tpl-error');
    if (tableContent) {
      tableContent.innerHTML = '';
      tableContent.appendChild(tpl.content.cloneNode(true));
    }
  }
}

/**
 * Apply current filters (status + search) to cached users and render
 */
function applyFilters() {
  const users = window.__usersCache || [];
  const statusEl = document.getElementById('userFilterStatus');
  const roleEl = document.getElementById('userFilterRole');
  const searchEl = document.getElementById('userSearchInput');

  const status = statusEl ? statusEl.value : 'all';
  const roleFilter = roleEl ? roleEl.value : 'all';
  const query = searchEl && searchEl.value ? searchEl.value.trim().toLowerCase() : '';

  const filtered = users.filter(u => {
    // status filter
    const isActive = u.isAccountActive !== false;
    if (status === 'active' && !isActive) return false;
    if (status === 'deactivated' && isActive) return false;

    // role filter
    if (roleFilter && roleFilter !== 'all') {
      const userRole = u.role || 'member';
      if (userRole !== roleFilter) return false;
    }

    // search filter (name/email)
    if (query) {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      if (!name.includes(query) && !email.includes(query)) return false;
    }

    return true;
  });

  displayUsers(filtered);
}

// ==================== DISPLAY USERS ====================

function displayUsers(users) {
  const tableContent = document.getElementById('tableContent');
  if (!tableContent) return;

  tableContent.innerHTML = '';

  if (!users || users.length === 0) {
    const tpl = document.getElementById('tpl-no-data');
    tableContent.appendChild(tpl.content.cloneNode(true));
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'users-grid';

  users.forEach(user => {
    const card = createUserCardElement(user);
    grid.appendChild(card);
  });

  tableContent.appendChild(grid);
  ErrorHandler.success(`Displayed ${users.length} users`, 'displayUsers');
}

/**
 * Create user card HTML
 */
function createUserCardElement(user) {
  const tpl = document.getElementById('user-card-template');
  const node = tpl.content.cloneNode(true);

  const avatar = node.querySelector('.user-avatar-large');
  const nameEl = node.querySelector('.user-name');
  const emailEl = node.querySelector('.user-email');
  const roleBadge = node.querySelector('.role-badge');
  const statusBadge = node.querySelector('.status-badge');
  const createdAtEl = node.querySelector('.created-at');
  const lastLoginEl = node.querySelector('.last-login');
  const btnRole = node.querySelector('.btn-role');
  const btnDeactivate = node.querySelector('.btn-deactivate');
  const btnActivate = node.querySelector('.btn-activate');

  // Avatar
  const avatarUrl = getAvatarUrl(user.photoURL, user.name);
  avatar.src = avatarUrl;
  avatar.alt = user.name || 'User';
  avatar.onerror = function() { this.src = getAvatarUrl(null, user.name); };

  // Details
  nameEl.textContent = user.name || 'No Name';
  emailEl.textContent = user.email || 'No Email';
  roleBadge.textContent = getRoleDisplayName(user.role);
  roleBadge.className = 'role-badge ' + getRoleBadgeClass(user.role);

  const isActive = user.isAccountActive !== false;
  statusBadge.textContent = isActive ? 'Active' : 'Deactivated';
  statusBadge.className = 'status-badge ' + (isActive ? 'status-account-active' : 'status-account-inactive');

  createdAtEl.textContent = formatDate(user.createdAt);
  lastLoginEl.textContent = formatDate(user.lastLogin);

  // Actions
  btnRole.addEventListener('click', () => window.changeUserRole(user.id, user.name, user.role || 'member'));
  if (isActive) {
    btnDeactivate.style.display = '';
    btnActivate.style.display = 'none';
    btnDeactivate.addEventListener('click', () => window.deactivateUser(user.id, user.name));
  } else {
    btnDeactivate.style.display = 'none';
    btnActivate.style.display = '';
    btnActivate.addEventListener('click', () => window.activateUser(user.id, user.name));
  }

  const wrapper = document.createElement('div');
  wrapper.appendChild(node);
  // The template root is the card div inside wrapper.firstElementChild
  return wrapper.firstElementChild;
}


// ==================== REAL-TIME LISTENER ====================

/**
 * Setup real-time listener for live updates
 */
function setupRealTimeListener() {
  UserService.listenToUsers((users) => {
    ErrorHandler.debug(`Real-time update: ${users.length} users`, 'setupRealTimeListener');
    window.__usersCache = users || [];
    applyFilters();
  });
}

// ==================== USER ACTIONS ====================

/**
 * Change user role function
 */
window.changeUserRole = async function(userId, userName, currentRole) {
  // Use role selection template from HTML, populate username and selected option
  const tpl = document.getElementById('tpl-role-selection');
  const container = document.createElement('div');
  container.appendChild(tpl.content.cloneNode(true));
  // set displayed name and selected role
  const nameEl = container.querySelector('.modal-user-name');
  const selectEl = container.querySelector('#roleSelect');
  if (nameEl) nameEl.textContent = userName;
  if (selectEl) selectEl.value = currentRole || 'member';

  ModalService.open({
    title: '🎭 Change User Role',
    body: container.innerHTML,
    confirmText: 'Update Role',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const newRole = document.getElementById('roleSelect').value;
      
      if (newRole === currentRole) {
        ModalService.showInfo('Role unchanged. No changes were made.', 'No Changes');
        return;
      }

      try {
        const success = await UserService.updateUserRole(userId, newRole);
        if (success) {
          ModalService.showSuccess(
            `${userName}'s role has been updated to ${getRoleDisplayName(newRole)}!`, 
            'Role Updated'
          );
          loadUsers();
        } else {
          ModalService.showError('Failed to update role. Please try again.');
        }
      } catch (error) {
        ErrorHandler.handle(error, 'changeUserRole');
        ModalService.showError('An error occurred. Please try again.');
      }
    }
  });
};

/**
 * Activate user function
 */
window.activateUser = async function(userId, userName) {
  const tpl = document.getElementById('tpl-activate-confirm');
  const container = document.createElement('div');
  container.appendChild(tpl.content.cloneNode(true));
  const nameEl = container.querySelector('.modal-user-name');
  if (nameEl) nameEl.textContent = userName;

  ModalService.open({
    title: '✅ Activate User Account',
    body: container.innerHTML,
    confirmText: 'Activate',
    cancelText: 'Cancel',
    onConfirm: async () => {
      try {
        const success = await UserService.activateUser(userId);
        if (success) {
          ModalService.showSuccess(
            `${userName}'s account has been activated!`, 
            'Account Activated'
          );
          loadUsers();
        } else {
          ModalService.showError('Failed to activate user. Please try again.');
        }
      } catch (error) {
        ErrorHandler.handle(error, 'activateUser');
        ModalService.showError('An error occurred. Please try again.');
      }
    }
  });
};

/**
 * Deactivate user function
 */
window.deactivateUser = async function(userId, userName) {
  const tpl = document.getElementById('tpl-deactivate-confirm');
  const container = document.createElement('div');
  container.appendChild(tpl.content.cloneNode(true));
  const nameEl = container.querySelector('.modal-user-name');
  if (nameEl) nameEl.textContent = userName;

  ModalService.open({
    title: '🚫 Deactivate User Account',
    body: container.innerHTML,
    confirmText: 'Deactivate',
    cancelText: 'Cancel',
    onConfirm: async () => {
      try {
        const success = await UserService.deactivateUser(userId);
        if (success) {
          ModalService.showSuccess(
            `${userName}'s account has been deactivated!`, 
            'Account Deactivated'
          );
          loadUsers();
        } else {
          ModalService.showError('Failed to deactivate user. Please try again.');
        }
      } catch (error) {
        ErrorHandler.handle(error, 'deactivateUser');
        ModalService.showError('An error occurred. Please try again.');
      }
    }
  });
};

// ==================== GLOBAL EXPORTS ====================

window.loadUsers = loadUsers;

// Setup filter UI handlers
function setupFiltersUI() {
  const statusEl = document.getElementById('userFilterStatus');
  const roleEl = document.getElementById('userFilterRole');
  const searchEl = document.getElementById('userSearchInput');

  if (statusEl) statusEl.addEventListener('change', () => applyFilters());
  if (roleEl) roleEl.addEventListener('change', () => applyFilters());
  if (searchEl) searchEl.addEventListener('input', () => applyFilters());
}

// Initialize listeners and cache
setupFiltersUI();
setupRealTimeListener();

// ==================== INITIALIZATION ====================

ErrorHandler.success('Users management module loaded', 'users.js');