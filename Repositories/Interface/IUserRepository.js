/**
 * User Repository Interface
 * Defines the contract for user data access operations
 */

export class IUserRepository {
  /**
   * Create a new user record
   * @param {string} userId - User ID
   * @param {Object} userData - User data object
   * @returns {Promise<boolean>} Success status
   */
  async create(userId, userData) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Get a user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User data or null
   */
  async getById(userId) {
    throw new Error('Method getById() must be implemented');
  }

  /**
   * Get all users
   * @returns {Promise<Array>} Array of user objects
   */
  async getAll() {
    throw new Error('Method getAll() must be implemented');
  }

  /**
   * Update a user record
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<boolean>} Success status
   */
  async update(userId, updates) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Delete a user record
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(userId) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Listen to real-time changes
   * @param {Function} callback - Callback function for data changes
   * @returns {Function} Unsubscribe function
   */
  listen(callback) {
    throw new Error('Method listen() must be implemented');
  }
}