/**
 * Event Repository Interface
 * Defines contract for event data access operations
 */
export class IEventRepository {
  async create(eventId, eventData) {
    throw new Error('create() method must be implemented');
  }

  async getById(eventId) {
    throw new Error('getById() method must be implemented');
  }

  async getAll() {
    throw new Error('getAll() method must be implemented');
  }

  async update(eventId, eventData) {
    throw new Error('update() method must be implemented');
  }

  async delete(eventId) {
    throw new Error('delete() method must be implemented');
  }

  async getByUserId(userId) {
    throw new Error('getByUserId() method must be implemented');
  }
}
