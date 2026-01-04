/**
 * Event Service Interface
 * Defines contract for event business logic operations
 */
export class IEventService {
  async createEvent(eventData) {
    throw new Error('createEvent() method must be implemented');
  }

  async updateEvent(eventId, eventData) {
    throw new Error('updateEvent() method must be implemented');
  }

  async deleteEvent(eventId) {
    throw new Error('deleteEvent() method must be implemented');
  }

  async getEvent(eventId) {
    throw new Error('getEvent() method must be implemented');
  }

  async getAllEvents() {
    throw new Error('getAllEvents() method must be implemented');
  }

  async getUserEvents(userId) {
    throw new Error('getUserEvents() method must be implemented');
  }

  async validateEvent(eventData) {
    throw new Error('validateEvent() method must be implemented');
  }
}
