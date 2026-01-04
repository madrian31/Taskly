import { database } from '../firebaseInit.js';
import { ref, set, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { IUserRepository } from './Interface/IUserRepository.js';

/**
 * Firebase implementation of User Repository
 * Handles all Firebase Realtime Database operations for users
 */
class UserRepository extends IUserRepository {
  constructor() {
    super();
    this.collectionPath = 'users';
  }

  /**
   * Create a new user record
   */
  async create(userId, userData) {
    try {
      const userRef = ref(database, `${this.collectionPath}/${userId}`);
      await set(userRef, {
        ...userData,
        createdAt: new Date().toISOString()
      });
      console.log('✅ User created:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      return false;
    }
  }

  /**
   * Get a user by ID
   */
  async getById(userId) {
    try {
      const userRef = ref(database, `${this.collectionPath}/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return {
          id: snapshot.key,
          ...snapshot.val()
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user:', error);
      return null;
    }
  }

  /**
   * Get all users
   */
  async getAll() {
    try {
      const usersRef = ref(database, this.collectionPath);
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = [];
        snapshot.forEach((childSnapshot) => {
          users.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return users;
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting all users:', error);
      return [];
    }
  }

  /**
   * Update a user record
   */
  async update(userId, updates) {
    try {
      const userRef = ref(database, `${this.collectionPath}/${userId}`);
      await update(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ User updated:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      return false;
    }
  }

  /**
   * Delete a user record
   */
  async delete(userId) {
    try {
      const userRef = ref(database, `${this.collectionPath}/${userId}`);
      await remove(userRef);
      console.log('✅ User deleted:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return false;
    }
  }

  /**
   * Listen to real-time changes
   */
  listen(callback) {
    const usersRef = ref(database, this.collectionPath);
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          users.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      callback(users);
    });

    return unsubscribe;
  }

  /**
   * Check if user exists
   */
  async exists(userId) {
    try {
      const userRef = ref(database, `${this.collectionPath}/${userId}`);
      const snapshot = await get(userRef);
      return snapshot.exists();
    } catch (error) {
      console.error('❌ Error checking user existence:', error);
      return false;
    }
  }

  /**
   * Update specific field
   */
  async updateField(userId, fieldName, value) {
    try {
      const updates = { [fieldName]: value };
      await this.update(userId, updates);
      return true;
    } catch (error) {
      console.error('❌ Error updating field:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new UserRepository();