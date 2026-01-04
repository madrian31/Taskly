import UserRepository from '../Repositories/UserRepository.js';
import { IUserService } from './Interface/IUserService.js';

// Default account status
const DEFAULT_ACCOUNT_STATUS = false

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMINISTRATOR: 'administrator',
  STAFF: 'staff',
  MODERATOR: 'moderator',
  MEMBER: 'member'
};

/**
 * User Service
 * Handles business logic for user operations with role management
 */
class UserService extends IUserService {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  /**
   * Handle user login - create or update user record
   */
  async handleLogin(user) {
    try {
      if (!user || !user.uid) {
        throw new Error('Invalid user object');
      }

      const existingUser = await this.repository.getById(user.uid);

      const userData = {
        name: user.displayName || 'No Name',
        email: user.email || 'No Email',
        // Preserve existing stored photoURL if provider didn't return one
        photoURL: user.photoURL || (existingUser ? (existingUser.photoURL || '') : ''),
        isAccountActive: existingUser ? existingUser.isAccountActive !== false : DEFAULT_ACCOUNT_STATUS,
        role: existingUser ? existingUser.role : USER_ROLES.MEMBER,
        lastLogin: new Date().toISOString()
      };

      if (existingUser) {
        await this.repository.update(user.uid, userData);
        console.log('👤 User login updated');
      } else {
        await this.repository.create(user.uid, userData);
        console.log('🆕 New user created with role: MEMBER');
      }

      return true;
    } catch (error) {
      console.error('❌ Error handling login:', error);
      return false;
    }
  }

  /**
   * Handle user logout - update logout timestamp
   */
  async handleLogout(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      await this.repository.update(userId, {
        lastLogout: new Date().toISOString()
      });

      console.log('👋 User logged out');
      return true;
    } catch (error) {
      console.error('❌ Error handling logout:', error);
      return false;
    }
  }

  /**
   * Get all users with optional filtering
   */
  async getAllUsers(filters = {}) {
    try {
      let users = await this.repository.getAll();

      // Apply filters
      if (filters.role) {
        users = users.filter(user => user.role === filters.role);
      }

      // Sort by created date (newest first)
      users.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      return users;
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      return await this.repository.getById(userId);
    } catch (error) {
      console.error('❌ Error getting user:', error);
      return null;
    }
  }

  /**
   * Get total users count
   */
  async getTotalUsersCount() {
    try {
      const users = await this.repository.getAll();
      return users.length;
    } catch (error) {
      console.error('❌ Error getting total users count:', error);
      return 0;
    }
  }

  /**
   * Listen to real-time user changes
   */
  listenToUsers(callback) {
    return this.repository.listen(callback);
  }

  /**
   * Delete user (admin function)
   */
  async deleteUser(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      await this.repository.delete(userId);
      console.log('🗑️ User deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return false;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const allowedFields = ['name', 'photoURL', 'email'];
      const updates = {};

      for (const field of allowedFields) {
        if (profileData[field] !== undefined) {
          updates[field] = profileData[field];
        }
      }

      await this.repository.update(userId, updates);
      console.log('✏️ Profile updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return false;
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query) {
    try {
      if (!query || query.trim() === '') {
        return await this.getAllUsers();
      }

      const users = await this.repository.getAll();
      const searchTerm = query.toLowerCase();

      return users.filter(user => {
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        return name.includes(searchTerm) || email.includes(searchTerm);
      });
    } catch (error) {
      console.error('❌ Error searching users:', error);
      return [];
    }
  }

  /**
   * Get recent users
   */
  async getRecentUsers(limit = 10) {
    try {
      const users = await this.getAllUsers();
      return users.slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting recent users:', error);
      return [];
    }
  }

  /**
   * Validate user data
   */
  validateUserData(userData) {
    const errors = [];

    if (!userData.name || userData.name.trim() === '') {
      errors.push('Name is required');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper: Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Activate a user account
   */
  async activateUser(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      await this.repository.update(userId, {
        isAccountActive: true,
        activatedAt: new Date().toISOString()
      });

      console.log('✅ User account activated:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error activating user:', error);
      return false;
    }
  }

  /**
   * Deactivate a user account
   */
  async deactivateUser(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      await this.repository.update(userId, {
        isAccountActive: false,
        deactivatedAt: new Date().toISOString()
      });

      console.log('🚫 User account deactivated:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error deactivating user:', error);
      return false;
    }
  }

  /**
   * Check if user account is activated
   */
  async isUserActivated(userId) {
    try {
      const user = await this.repository.getById(userId);
      return user ? user.isAccountActive !== false : false;
    } catch (error) {
      console.error('❌ Error checking user activation:', error);
      return false;
    }
  }

  // ==================== ROLE MANAGEMENT ====================

  /**
   * Update user role
   */
  async updateUserRole(userId, role) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!Object.values(USER_ROLES).includes(role)) {
        throw new Error('Invalid role. Must be one of: administrator, staff, moderator, member');
      }

      await this.repository.update(userId, {
        role: role,
        roleUpdatedAt: new Date().toISOString()
      });

      console.log(`🎭 User role updated to: ${role}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      return false;
    }
  }

  /**
   * Get user role
   */
  async getUserRole(userId) {
    try {
      const user = await this.repository.getById(userId);
      return user ? (user.role || USER_ROLES.MEMBER) : null;
    } catch (error) {
      console.error('❌ Error getting user role:', error);
      return null;
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId, role) {
    try {
      const userRole = await this.getUserRole(userId);
      return userRole === role;
    } catch (error) {
      console.error('❌ Error checking user role:', error);
      return false;
    }
  }

  /**
   * Check if user is administrator
   */
  async isAdministrator(userId) {
    return await this.hasRole(userId, USER_ROLES.ADMINISTRATOR);
  }

  /**
   * Check if user is staff
   */
  async isStaff(userId) {
    return await this.hasRole(userId, USER_ROLES.STAFF);
  }

  /**
   * Check if user is moderator
   */
  async isModerator(userId) {
    return await this.hasRole(userId, USER_ROLES.MODERATOR);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role) {
    try {
      if (!Object.values(USER_ROLES).includes(role)) {
        throw new Error('Invalid role');
      }

      return await this.getAllUsers({ role });
    } catch (error) {
      console.error('❌ Error getting users by role:', error);
      return [];
    }
  }

  /**
   * Get role statistics
   */
  async getRoleStatistics() {
    try {
      const users = await this.repository.getAll();
      
      const stats = {
        administrator: 0,
        staff: 0,
        moderator: 0,
        member: 0,
        total: users.length
      };

      users.forEach(user => {
        const role = user.role || USER_ROLES.MEMBER;
        if (stats[role] !== undefined) {
          stats[role]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting role statistics:', error);
      return null;
    }
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role) {
    const displayNames = {
      [USER_ROLES.ADMINISTRATOR]: 'Administrator',
      [USER_ROLES.STAFF]: 'Staff',
      [USER_ROLES.MODERATOR]: 'Moderator',
      [USER_ROLES.MEMBER]: 'Member'
    };

    return displayNames[role] || 'Member';
  }

  /**
   * Get role badge class for UI
   */
  getRoleBadgeClass(role) {
    const badgeClasses = {
      [USER_ROLES.ADMINISTRATOR]: 'role-administrator',
      [USER_ROLES.STAFF]: 'role-staff',
      [USER_ROLES.MODERATOR]: 'role-moderator',
      [USER_ROLES.MEMBER]: 'role-member'
    };

    return badgeClasses[role] || 'role-member';
  }
}

// Export singleton instance
export default new UserService(UserRepository);