/**
 * User Service Interface
 * Defines the contract for user business logic operations
 */

export class IUserService {
  /**
   * Handle user login - create or update user record
   * @param {Object} user - Firebase user object
   * @returns {Promise<boolean>} Success status
   */
  async handleLogin(user) {
    throw new Error('Method handleLogin() must be implemented');
  }

  /**
   * Handle user logout - mark user as inactive
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async handleLogout(userId) {
    throw new Error('Method handleLogout() must be implemented');
  }

  /**
   * Get all users with optional filtering
   * @param {Object} filters - Filter options (e.g., { isActive: true })
   * @returns {Promise<Array>} Array of user objects
   */
  async getAllUsers(filters = {}) {
    throw new Error('Method getAllUsers() must be implemented');
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserById(userId) {
    throw new Error('Method getUserById() must be implemented');
  }

  /**
   * Get active users count
   * @returns {Promise<number>} Count of active users
   */
  async getActiveUsersCount() {
    throw new Error('Method getActiveUsersCount() must be implemented');
  }

  /**
   * Listen to real-time user changes
   * @param {Function} callback - Callback function for data changes
   * @returns {Function} Unsubscribe function
   */
  listenToUsers(callback) {
    throw new Error('Method listenToUsers() must be implemented');
  }

  /**
   * Delete user (admin function)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(userId) {
    throw new Error('Method deleteUser() must be implemented');
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<boolean>} Success status
   */
  async updateProfile(userId, profileData) {
    throw new Error('Method updateProfile() must be implemented');
  }

  /**
   * Search users by name or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching users
   */
  async searchUsers(query) {
    throw new Error('Method searchUsers() must be implemented');
  }

  /**
   * Get users by status
   * @param {boolean} isActive - Active status filter
   * @returns {Promise<Array>} Array of users
   */
  async getUsersByStatus(isActive) {
    throw new Error('Method getUsersByStatus() must be implemented');
  }

  /**
   * Get recent users
   * @param {number} limit - Number of users to return
   * @returns {Promise<Array>} Array of recent users
   */
  async getRecentUsers(limit = 10) {
    throw new Error('Method getRecentUsers() must be implemented');
  }

  /**
   * Validate user data
   * @param {Object} userData - User data to validate
   * @returns {Object} Validation result { isValid: boolean, errors: Array }
   */
  validateUserData(userData) {
    throw new Error('Method validateUserData() must be implemented');
  }

  /**
   * Activate a user account
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async activateUser(userId) {
    throw new Error('Method activateUser() must be implemented');
  }

  /**
   * Deactivate a user account
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deactivateUser(userId) {
    throw new Error('Method deactivateUser() must be implemented');
  }

  /**
   * Check if user account is activated
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Activation status
   */
  async isUserActivated(userId) {
    throw new Error('Method isUserActivated() must be implemented');
  }
}