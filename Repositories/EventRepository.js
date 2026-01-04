import { database } from '../firebaseInit.js';
import { ref, set, get, update, remove, onValue, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { IEventRepository } from './Interface/IEventRepository.js';

/**
 * Firebase implementation of Event Repository
 * Handles all Firebase Realtime Database operations for events
 */
class EventRepository extends IEventRepository {
  constructor() {
    super();
    this.collectionPath = 'events';
  }

  /**
   * Create a new event record
   */
  async create(eventId, eventData) {
    try {
      const eventRef = ref(database, `${this.collectionPath}/${eventId}`);
      await set(eventRef, {
        ...eventData,
        createdBy: eventData.userId || null,
        createdAt: new Date().toISOString()
      });
      console.log('✅ Event created:', eventId);
      return true;
    } catch (error) {
      console.error('❌ Error creating event:', error);
      return false;
    }
  }

  /**
   * Get an event by ID
   */
  async getById(eventId) {
    try {
      const eventRef = ref(database, `${this.collectionPath}/${eventId}`);
      const snapshot = await get(eventRef);
      
      if (snapshot.exists()) {
        return {
          id: snapshot.key,
          ...snapshot.val()
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting event:', error);
      return null;
    }
  }

  /**
   * Get all events
   */
  async getAll() {
    try {
      const eventsRef = ref(database, this.collectionPath);
      const snapshot = await get(eventsRef);
      
      if (snapshot.exists()) {
        const events = [];
        snapshot.forEach((childSnapshot) => {
          events.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return events;
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting all events:', error);
      return [];
    }
  }

  /**
   * Get events by user ID
   * Falls back to reading all events and filtering client-side if query fails
   */
  async getByUserId(userId) {
    try {
      // Try the optimized query first
      const eventsRef = ref(database, this.collectionPath);
      const q = query(eventsRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(q);
      
      if (snapshot.exists()) {
        const events = [];
        snapshot.forEach((childSnapshot) => {
          events.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return events;
      }
      return [];
    } catch (error) {
      // Fallback: Read all events and filter client-side
      console.warn('⚠️ Optimized query failed, falling back to client-side filtering:', error);
      try {
        const eventsRef = ref(database, this.collectionPath);
        const snapshot = await get(eventsRef);
        
        if (snapshot.exists()) {
          const events = [];
          snapshot.forEach((childSnapshot) => {
            const eventData = childSnapshot.val();
            // Filter by userId on client side
            if (eventData.userId === userId) {
              events.push({
                id: childSnapshot.key,
                ...eventData
              });
            }
          });
          console.log('✅ Retrieved', events.length, 'events for user:', userId);
          return events;
        }
        return [];
      } catch (fallbackError) {
        console.error('❌ Error getting user events (both methods failed):', fallbackError);
        return [];
      }
    }
  }

  /**
   * Update an event
   */
  async update(eventId, eventData) {
    try {
      const eventRef = ref(database, `${this.collectionPath}/${eventId}`);
      // Avoid overwriting creator-related fields (createdBy, userId)
      const payload = { ...eventData };
      // If caller included a temporary `userId`, do not persist it on update
      if (payload.hasOwnProperty('userId')) delete payload.userId;

      await update(eventRef, {
        ...payload,
        updatedBy: eventData.userId || eventData.updatedBy || null,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Event updated:', eventId);
      return true;
    } catch (error) {
      console.error('❌ Error updating event:', error);
      return false;
    }
  }

  /**
   * Delete an event
   */
  async delete(eventId) {
    try {
      const eventRef = ref(database, `${this.collectionPath}/${eventId}`);
      await remove(eventRef);
      console.log('✅ Event deleted:', eventId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      return false;
    }
  }
}

export default new EventRepository();
