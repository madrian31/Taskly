import EventRepository from '../Repositories/EventRepository.js';
import { IEventService } from './Interface/IEventService.js';

/**
 * Event Types/Categories
 */
export const EVENT_TYPES = {
  MEETING: 'Meeting',
  BIRTHDAY: 'Birthday',
  HOLIDAY: 'Holiday',
  TASK: 'Task',
  APPOINTMENT: 'Appointment',
  REMINDER: 'Reminder',
  OTHER: 'Other'
};

/**
 * Event Status
 */
export const EVENT_STATUS = {
  CONFIRMED: 'Confirmed',
  TENTATIVE: 'Tentative',
  CANCELLED: 'Cancelled'
};

/**
 * Recurrence Types
 */
export const RECURRENCE_TYPES = {
  NONE: 'None',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly'
};

/**
 * Reminder Times
 */
export const REMINDER_TIMES = {
  FIVE_MIN: '5 minutes',
  FIFTEEN_MIN: '15 minutes',
  ONE_HOUR: '1 hour',
  ONE_DAY: '1 day'
};

/**
 * Event Service
 * Handles business logic for event operations
 */
class EventService extends IEventService {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  /**
   * Create a new event
   */
  async createEvent(eventData) {
    try {
      // Validate event data
      const validation = this.validateEvent(eventData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const event = {
        title: eventData.title,
        description: eventData.description || '',
        startDate: eventData.startDate,
        endDate: eventData.endDate || eventData.startDate,
        startTime: eventData.startTime,
        endTime: eventData.endTime || eventData.startTime,
        location: eventData.location || '',
        eventType: eventData.eventType || EVENT_TYPES.OTHER,
        isAllDay: eventData.isAllDay || false,
        recurrence: eventData.recurrence || RECURRENCE_TYPES.NONE,
        status: eventData.status || EVENT_STATUS.CONFIRMED,
        userId: eventData.userId,
        notes: eventData.notes || ''
      };

      const result = await this.repository.create(eventId, event);
      return result ? { success: true, eventId } : { success: false, error: 'Failed to create event' };
    } catch (error) {
      console.error('❌ Error in createEvent:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId, eventData) {
    try {
      const validation = this.validateEvent(eventData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const event = {
        title: eventData.title,
        description: eventData.description || '',
        startDate: eventData.startDate,
        endDate: eventData.endDate || eventData.startDate,
        startTime: eventData.startTime,
        endTime: eventData.endTime || eventData.startTime,
        location: eventData.location || '',
        eventType: eventData.eventType || EVENT_TYPES.OTHER,
        isAllDay: eventData.isAllDay || false,
        recurrence: eventData.recurrence || RECURRENCE_TYPES.NONE,
        status: eventData.status || EVENT_STATUS.CONFIRMED,
        notes: eventData.notes || ''
      };

      // include user who performed the update as `updatedBy` (do not overwrite `userId`/creator)
      const eventWithUpdater = {
        ...event,
        updatedBy: eventData.userId
      };

      const result = await this.repository.update(eventId, eventWithUpdater);
      return result ? { success: true } : { success: false, error: 'Failed to update event' };
    } catch (error) {
      console.error('❌ Error in updateEvent:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId) {
    try {
      const result = await this.repository.delete(eventId);
      return result ? { success: true } : { success: false, error: 'Failed to delete event' };
    } catch (error) {
      console.error('❌ Error in deleteEvent:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a single event
   */
  async getEvent(eventId) {
    try {
      const event = await this.repository.getById(eventId);
      return event ? { success: true, data: event } : { success: false, error: 'Event not found' };
    } catch (error) {
      console.error('❌ Error in getEvent:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all events
   */
  async getAllEvents() {
    try {
      const events = await this.repository.getAll();
      return { success: true, data: events };
    } catch (error) {
      console.error('❌ Error in getAllEvents:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's events
   */
  async getUserEvents(userId) {
    try {
      const events = await this.repository.getByUserId(userId);
      return { success: true, data: events };
    } catch (error) {
      console.error('❌ Error in getUserEvents:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate event data
   */
  validateEvent(eventData) {
    const errors = [];

    if (!eventData.title || eventData.title.trim() === '') {
      errors.push('Event title is required');
    }

    if (!eventData.startDate) {
      errors.push('Start date is required');
    }

    if (!eventData.startTime) {
      errors.push('Start time is required');
    }

    if (eventData.title && eventData.title.length > 200) {
      errors.push('Event title cannot exceed 200 characters');
    }

    if (eventData.description && eventData.description.length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new EventService(EventRepository);
