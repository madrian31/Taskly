// events.js - Event Management Page (FIXED VERSION)
import EventService, { EVENT_TYPES, EVENT_STATUS, RECURRENCE_TYPES, REMINDER_TIMES } from '../../Services/EventService.js';
import UserService from '../../Services/UserService.js';
import { getCurrentUser, getCurrentUserData } from './auth.js';
import ModalService from './ModalService.js';

let currentUser = null;
let allEvents = [];
let editingEventId = null;
// store original modal footer so we can restore buttons after replacing it for success view
// store original modal footer nodes so we can restore buttons after showing success
let originalModalFooterClone = null;

/**
 * Load and display events
 */
async function loadEvents() {
  try {
    const user = getCurrentUser();
    if (!user) {
      showErrorMessage('User not found');
      return;
    }

    currentUser = user;
    // By design we show only the signed-in user's events.
    // If the signed-in user is an administrator, load all events so they can view/manage others'.
    let result;
    try {
      const userRecord = await UserService.getUserById(user.uid);
      const isAdmin = userRecord && userRecord.role === 'administrator';

      if (isAdmin) {
        result = await EventService.getAllEvents();
      } else {
        result = await EventService.getUserEvents(user.uid);
      }
    } catch (err) {
      console.warn('Error checking user role; falling back to user events', err);
      result = await EventService.getUserEvents(user.uid);
    }
    
    if (result.success) {
      // enrich and store events so modal view has creator/updater info
      allEvents = await enrichEvents(result.data);
      // Sort events by start datetime (earliest first).
      // Treat missing times as 00:00 so all-day events or unspecified times appear at start of day.
      allEvents.sort((a, b) => {
        try {
          const aStart = new Date(`${a.startDate}T${(a.startTime || '00:00')}:00`);
          const bStart = new Date(`${b.startDate}T${(b.startTime || '00:00')}:00`);
          if (aStart - bStart !== 0) return aStart - bStart;

          const aEnd = new Date(`${(a.endDate || a.startDate)}T${(a.endTime || '00:00')}:00`);
          const bEnd = new Date(`${(b.endDate || b.startDate)}T${(b.endTime || '00:00')}:00`);
          if (aEnd - bEnd !== 0) return aEnd - bEnd;

          // fallback to createdAt if available
          if (a.createdAt && b.createdAt) return new Date(a.createdAt) - new Date(b.createdAt);
        } catch (err) {
          // if parsing fails, keep original order
          console.warn('events: sort parse error', err);
        }
        return 0;
      });
      await displayEvents(allEvents);
    } else {
      showErrorMessage('Failed to load events');
    }
  } catch (error) {
    console.error('❌ Error loading events:', error);
    showErrorMessage('Error loading events');
  }
}

/**
 * Display events in card format (matching User Management design)
 */
async function displayEvents(events) {
  const tableContent = document.getElementById('tableContent');
  if (!tableContent) return;

  // clear children without using innerHTML
  while (tableContent.firstChild) tableContent.removeChild(tableContent.firstChild);

  if (!events || events.length === 0) {
    const tpl = document.getElementById('tpl-empty-events');
    tableContent.appendChild(tpl.content.cloneNode(true));
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'events-grid';

  events.forEach(ev => {
    const card = createEventCardElement(ev);
    grid.appendChild(card);
  });

  tableContent.appendChild(grid);
}


/**
 * Enrich events with creator/updater names and photos so modal can display them.
 */
async function enrichEvents(events) {
  return await Promise.all(events.map(async (ev) => {
    const creatorId = ev.createdBy || ev.userId || null;
    const updaterId = ev.updatedBy || null;

    let creatorName = null;
    let creatorPhoto = null;
    let updaterName = null;
    let updaterPhoto = null;

    try {
      if (creatorId) {
        const u = await UserService.getUserById(creatorId);
        if (u) {
          creatorName = u.name || null;
          creatorPhoto = u.photoURL || null;
        }
      }

      if (updaterId) {
        const uu = await UserService.getUserById(updaterId);
        if (uu) {
          updaterName = uu.name || null;
          updaterPhoto = uu.photoURL || null;
        }
      }
    } catch (err) {
      console.warn('Could not fetch user info for event audit fields', err);
    }

    return { ...ev, creatorName, creatorPhoto, updaterName, updaterPhoto };
  }));
}

/**
 * Create event card HTML
 */
function createEventCardElement(event) {
  const tpl = document.getElementById('tpl-event-card');
  const node = tpl.content.cloneNode(true);

  const avatar = node.querySelector('.creator-avatar');
  const creatorNameEl = node.querySelector('.creator-name');
  const createdRelative = node.querySelector('.created-relative');
  const titleEl = node.querySelector('.event-title-value');
  const dateEl = node.querySelector('.event-date-value');
  const timeEl = node.querySelector('.event-time-value');
  const typeBadge = node.querySelector('.type-badge');
  const locationEl = node.querySelector('.event-location-value');
  const statusBadge = node.querySelector('.status-badge');
  const recurrenceEl = node.querySelector('.event-recurrence-value');
  const btnView = node.querySelector('.event-btn.view');
  const btnEdit = node.querySelector('.event-btn.edit');
  const btnDelete = node.querySelector('.event-btn.delete');

  avatar.src = avatarUrl(event.creatorName, event.creatorPhoto);
  avatar.alt = event.creatorName || 'Creator';
  creatorNameEl.textContent = event.creatorName || event.createdBy || event.userId || 'Unknown';
  createdRelative.textContent = formatRelativeDate(event.createdAt);
  titleEl.textContent = event.title || '';
  dateEl.textContent = (event.startDate !== event.endDate && event.endDate) ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}` : formatDate(event.startDate);
  timeEl.textContent = event.isAllDay ? 'All Day' : formatTimeRange(event.startTime, event.endTime);
  typeBadge.textContent = event.eventType || '';
  typeBadge.className = 'event-type-badge ' + (event.eventType ? event.eventType.toLowerCase().replace(/\s+/g, '') : '');
  locationEl.textContent = event.location || 'Not specified';
  statusBadge.textContent = event.status || '';
  statusBadge.className = 'event-status-badge ' + (event.status ? event.status.toLowerCase().replace(/\s+/g, '') : '');
  recurrenceEl.textContent = event.recurrence || '';

  // attach handlers
  btnView.addEventListener('click', () => viewEvent(event.id));
  btnEdit.addEventListener('click', () => editEvent(event.id));
  btnDelete.addEventListener('click', () => deleteEvent(event.id));

  const wrapper = document.createElement('div');
  wrapper.appendChild(node);
  return wrapper.firstElementChild;
}

/**
 * Get icon for event type
 */
function getEventIcon(eventType) {
  const icons = {
    'Meeting': 'fas fa-users',
    'Birthday': 'fas fa-birthday-cake',
    'Holiday': 'fas fa-umbrella-beach',
    'Task': 'fas fa-tasks',
    'Appointment': 'fas fa-calendar-check',
    'Reminder': 'fas fa-bell',
    'Other': 'fas fa-calendar'
  };
  return icons[eventType] || 'fas fa-calendar';
}

/**
 * Format relative date (like "5d ago", "Just now")
 */
function formatRelativeDate(dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffHours < 1) return `${diffMins}m ago`;
  if (diffDays < 1) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(dateString.split('T')[0]);
}

/**
 * Open create event modal
 */
function openCreateEventModal() {
  editingEventId = null;
  openEventModal('Create Event');
}

/**
 * Open event modal (for create/edit)
 */
function openEventModal(title) {
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.getElementById('modalFooter');

  const isEditing = editingEventId !== null;
  const event = isEditing ? allEvents.find(e => e.id === editingEventId) : null;

  modalTitle.textContent = title;

  // Use the form template and populate fields to avoid large template strings
  const tplForm = document.getElementById('tpl-event-form');
  const formNode = tplForm.content.cloneNode(true);

  // populate simple fields
  const formEl = formNode.querySelector('#eventForm');
  if (formEl) {
    const setValue = (selector, value) => {
      const el = formEl.querySelector(selector);
      if (!el) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') el.value = value || '';
      if (el.type === 'checkbox') el.checked = !!value;
    };

    setValue('#eventTitle', event ? event.title : '');
    setValue('#eventDate', event ? event.startDate : '');
    setValue('#eventEndDate', event ? event.endDate : '');
    setValue('#eventAllDay', event && event.isAllDay ? true : false);
    setValue('#eventStartTime', event && !event.isAllDay ? event.startTime : '');
    setValue('#eventEndTime', event && !event.isAllDay ? event.endTime : '');
    setValue('#eventDescription', event ? event.description : '');
    setValue('#eventLocation', event ? event.location : '');
    setValue('#eventNotes', event ? event.notes : '');

    // populate select options from constants
    const typeSelect = formEl.querySelector('#eventType');
    const statusSelect = formEl.querySelector('#eventStatus');
    const recurSelect = formEl.querySelector('#eventRecurrence');

    if (typeSelect) {
      Object.values(EVENT_TYPES).forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        if (event && event.eventType === t) opt.selected = true;
        typeSelect.appendChild(opt);
      });
    }
    if (statusSelect) {
      Object.values(EVENT_STATUS).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (event && event.status === s) opt.selected = true;
        statusSelect.appendChild(opt);
      });
    }
    if (recurSelect) {
      Object.values(RECURRENCE_TYPES).forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        if (event && event.recurrence === r) opt.selected = true;
        recurSelect.appendChild(opt);
      });
    }
  }

  // replace modal body with cloned form (avoid innerHTML)
  while (modalBody.firstChild) modalBody.removeChild(modalBody.firstChild);
  modalBody.appendChild(formNode);

  // If a previous operation replaced the footer (e.g. success view), restore it
  if (originalModalFooterClone) {
    // restore footer nodes
    while (modalFooter.firstChild) modalFooter.removeChild(modalFooter.firstChild);
    originalModalFooterClone.forEach(n => modalFooter.appendChild(n.cloneNode(true)));
    originalModalFooterClone = null;
  }

  // Use the modal's built-in confirm/cancel buttons instead of replacing footer HTML
  // This ensures ModalService/modal.open can control visibility correctly
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');

  if (modalConfirmBtn) {
    modalConfirmBtn.textContent = isEditing ? 'Update Event' : 'Create Event';
    modalConfirmBtn.onclick = async (e) => {
      e?.preventDefault?.();
      await saveEvent();
    };
    // ensure the button uses the project's btn styles
    modalConfirmBtn.className = 'btn btn-primary';
  }

  if (modalCancelBtn) {
    modalCancelBtn.textContent = 'Cancel';
    modalCancelBtn.onclick = () => closeModal();
    // ensure the button uses the project's btn styles
    modalCancelBtn.className = 'btn btn-secondary';
  }

  // Add event listener for all-day checkbox
  const allDayCheckbox = document.getElementById('eventAllDay');
  allDayCheckbox.addEventListener('change', handleAllDayChange);

  // CRITICAL: Initialize the form state immediately after the form is created
  // This ensures that if we're editing an all-day event, the time fields are properly hidden
  // and the required attribute is removed to prevent validation errors
  handleAllDayChange();

  // Add date validation
  const startDateInput = document.getElementById('eventDate');
  const endDateInput = document.getElementById('eventEndDate');

  startDateInput.addEventListener('change', () => {
    // Set min date for end date to be same as or after start date
    endDateInput.min = startDateInput.value;
    
    // If end date is before start date, reset it
    if (endDateInput.value && endDateInput.value < startDateInput.value) {
      endDateInput.value = startDateInput.value;
    }
  });

  endDateInput.addEventListener('change', () => {
    // If end date is before start date, show warning and reset
    if (endDateInput.value && endDateInput.value < startDateInput.value) {
      alert('End date cannot be before start date!');
      endDateInput.value = startDateInput.value;
    }
  });

  // Set initial min date if editing
  if (startDateInput.value) {
    endDateInput.min = startDateInput.value;
  }

  // Open modal using .active class
  const modalContainer = document.getElementById('modalContainer');
  modalContainer.classList.add('active');
  modalContainer.style.display = 'flex';
}

/**
 * Handle all-day event checkbox change - FIXED VERSION
 */
function handleAllDayChange() {
  const isAllDay = document.getElementById('eventAllDay').checked;
  const timeFields = document.getElementById('timeFields');
  const startTimeInput = document.getElementById('eventStartTime');
  const endTimeInput = document.getElementById('eventEndTime');
  
  if (isAllDay) {
    timeFields.style.display = 'none';
    startTimeInput.removeAttribute('required');
    endTimeInput.removeAttribute('required');
    // Set default values to prevent validation errors
    startTimeInput.value = '00:00';
    endTimeInput.value = '23:59';
  } else {
    timeFields.style.display = 'grid';
    startTimeInput.setAttribute('required', 'required');
    // Clear default values when switching back
    if (startTimeInput.value === '00:00') startTimeInput.value = '';
    if (endTimeInput.value === '23:59') endTimeInput.value = '';
  }
}

/**
 * Show inline success message in modal
 */
function showInlineSuccess(message) {
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.getElementById('modalFooter');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');

  // Clear any existing event handlers by cloning and replacing
  if (modalConfirmBtn) {
    const newConfirmBtn = modalConfirmBtn.cloneNode(true);
    modalConfirmBtn.parentNode.replaceChild(newConfirmBtn, modalConfirmBtn);
  }
  
  if (modalCancelBtn) {
    const newCancelBtn = modalCancelBtn.cloneNode(true);
    modalCancelBtn.parentNode.replaceChild(newCancelBtn, modalCancelBtn);
  }

  modalTitle.textContent = '✅ Success';

  // Use success template
  const tplSuccess = document.getElementById('tpl-success-inline');
  const successNode = tplSuccess.content.cloneNode(true);
  const successMsg = successNode.querySelector('.success-message');
  if (successMsg) successMsg.textContent = message;

  // replace modal body
  while (modalBody.firstChild) modalBody.removeChild(modalBody.firstChild);
  modalBody.appendChild(successNode);

  // IMPORTANT: Replace the footer buttons with just an OK button
  // mark that we want the page to refresh if the modal is closed by clicking outside
  window.shouldReloadAfterModalClose = true;

  // save original footer nodes so we can restore later
  if (!originalModalFooterClone) {
    originalModalFooterClone = Array.from(modalFooter.childNodes).map(n => n.cloneNode(true));
  }

  // replace footer with a single OK button (DOM)
  while (modalFooter.firstChild) modalFooter.removeChild(modalFooter.firstChild);
  const okBtn = document.createElement('button');
  okBtn.className = 'btn btn-primary';
  okBtn.style.width = '100%';
  okBtn.textContent = 'OK';
  okBtn.addEventListener('click', closeModalAndReload);
  modalFooter.appendChild(okBtn);
}

/**
 * Save event (create or update)
 */
async function saveEvent() {
  try {
    const form = document.getElementById('eventForm');
    
    // Check form validity
    if (!form.checkValidity()) {
      // DON'T close the modal - just show inline error
      // We want to keep the form open so user can fix the errors
      const modalBody = document.getElementById('modalBody');
      
      // Add error message at the top of the form
      const existingError = document.querySelector('.inline-error-message');
      if (existingError) {
        existingError.remove();
      }

      const errorDiv = document.createElement('div');
      errorDiv.className = 'inline-error-message';
      errorDiv.style.cssText = 'background: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 6px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;';
      const icon = document.createElement('i');
      icon.className = 'fas fa-exclamation-circle';
      const msgSpan = document.createElement('span');
      msgSpan.textContent = 'Please fill in all required fields';
      errorDiv.appendChild(icon);
      errorDiv.appendChild(msgSpan);

      modalBody.insertBefore(errorDiv, modalBody.firstChild);
      
      form.reportValidity(); // Also show browser validation
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      ModalService.showError('User not authenticated');
      return;
    }

    const startDate = document.getElementById('eventDate').value;
    const endDateValue = document.getElementById('eventEndDate').value;
    const endDate = endDateValue || startDate;

    // Validate that end date is not before start date
    if (endDate < startDate) {
      // Show inline error instead of new modal
      const modalBody = document.getElementById('modalBody');
      const existingError = document.querySelector('.inline-error-message');
      if (existingError) {
        existingError.remove();
      }

      const errorDiv = document.createElement('div');
      errorDiv.className = 'inline-error-message';
      errorDiv.style.cssText = 'background: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 6px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;';
      const icon2 = document.createElement('i');
      icon2.className = 'fas fa-exclamation-circle';
      const msgSpan2 = document.createElement('span');
      msgSpan2.textContent = 'End date cannot be before start date!';
      errorDiv.appendChild(icon2);
      errorDiv.appendChild(msgSpan2);

      modalBody.insertBefore(errorDiv, modalBody.firstChild);
      return;
    }

    const eventData = {
      title: document.getElementById('eventTitle').value.trim(),
      startDate: startDate,
      endDate: endDate,
      startTime: document.getElementById('eventAllDay').checked ? '00:00' : document.getElementById('eventStartTime').value,
      endTime: document.getElementById('eventAllDay').checked ? '23:59' : (document.getElementById('eventEndTime').value || document.getElementById('eventStartTime').value),
      eventType: document.getElementById('eventType').value,
      location: document.getElementById('eventLocation').value.trim(),
      recurrence: document.getElementById('eventRecurrence').value,
      status: document.getElementById('eventStatus').value,
      isAllDay: document.getElementById('eventAllDay').checked,
      description: document.getElementById('eventDescription').value.trim(),
      notes: document.getElementById('eventNotes').value.trim(),
      userId: user.uid
    };

    let result;
    if (editingEventId) {
      result = await EventService.updateEvent(editingEventId, eventData);
      if (result.success) {
        showInlineSuccess('Event updated successfully!');
        return;
      }
    } else {
      result = await EventService.createEvent(eventData);
      if (result.success) {
        showInlineSuccess('Event created successfully!');
        return;
      }
    }

    // If we reach here, something went wrong
    if (!result.success) {
      ModalService.showError(result.error || 'Failed to save event');
    }
  } catch (error) {
    console.error('❌ Error saving event:', error);
    ModalService.showError('Error saving event');
  }
}

/**
 * View event details
 */
function viewEvent(eventId) {
  const event = allEvents.find(e => e.id === eventId);
  console.log('viewEvent payload:', event);
  if (!event) return;

  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.getElementById('modalFooter');

  modalTitle.textContent = '📅 Event Details';

  // build details using template
  const tplDetails = document.getElementById('tpl-event-details');
  const detailsNode = tplDetails.content.cloneNode(true);
  const detailsContainer = detailsNode.querySelector('.event-details');

  const addRow = (label, value) => {
    const row = document.createElement('div');
    row.className = 'detail-row';
    const strong = document.createElement('strong');
    strong.textContent = label;
    const span = document.createElement('span');
    // value is expected to be plain text here
    span.textContent = value;
    row.appendChild(strong);
    row.appendChild(document.createTextNode(' '));
    row.appendChild(span);
    detailsContainer.appendChild(row);
  };

  addRow('Title:', escapeHtml(event.title));
  addRow('Date Range:', `${formatDate(event.startDate)} to ${formatDate(event.endDate)}`);
  addRow('Time:', event.isAllDay ? 'All Day' : `${event.startTime} - ${event.endTime}`);
  addRow('Type:', event.eventType || '');
  addRow('Location:', event.location || 'Not specified');
  addRow('Description:', escapeHtml(event.description) || 'No description');
  addRow('Recurrence:', event.recurrence || '');
  addRow('Status:', event.status || '');
  if (event.notes) addRow('Notes:', escapeHtml(event.notes));
  addRow('Created:', formatDateTime(event.createdAt));

  // Created By row with avatar
  const createdRow = document.createElement('div');
  createdRow.className = 'detail-row';
  const createdStrong = document.createElement('strong');
  createdStrong.textContent = 'Created By:';
  const createdSpan = document.createElement('span');
  const createdMeta = document.createElement('span');
  createdMeta.className = 'created-meta';
  const createdImg = document.createElement('img');
  createdImg.className = 'avatar';
  createdImg.alt = 'creator';
  createdImg.src = avatarUrl(event.creatorName, event.creatorPhoto);
  const createdName = document.createElement('span');
  createdName.textContent = event.creatorName || event.createdBy || event.userId || 'Unknown';
  createdMeta.appendChild(createdImg);
  createdMeta.appendChild(document.createTextNode(' '));
  createdMeta.appendChild(createdName);
  createdSpan.appendChild(createdMeta);
  createdRow.appendChild(createdStrong);
  createdRow.appendChild(document.createTextNode(' '));
  createdRow.appendChild(createdSpan);
  detailsContainer.appendChild(createdRow);

  if (event.updatedAt) {
    addRow('Last Updated:', formatDateTime(event.updatedAt));
    const updatedRow = document.createElement('div');
    updatedRow.className = 'detail-row';
    const updatedStrong = document.createElement('strong');
    updatedStrong.textContent = 'Updated By:';
    const updatedSpan = document.createElement('span');
    const updatedMeta = document.createElement('span');
    updatedMeta.className = 'created-meta';
    const updatedImg = document.createElement('img');
    updatedImg.className = 'avatar';
    updatedImg.alt = 'updater';
    updatedImg.src = avatarUrl(event.updaterName || event.updatedBy || 'User', event.updaterPhoto);
    const updatedName = document.createElement('span');
    updatedName.textContent = event.updaterName || event.updatedBy || 'Unknown';
    updatedMeta.appendChild(updatedImg);
    updatedMeta.appendChild(document.createTextNode(' '));
    updatedMeta.appendChild(updatedName);
    updatedSpan.appendChild(updatedMeta);
    updatedRow.appendChild(updatedStrong);
    updatedRow.appendChild(document.createTextNode(' '));
    updatedRow.appendChild(updatedSpan);
    detailsContainer.appendChild(updatedRow);
  }

  // replace modal body
  while (modalBody.firstChild) modalBody.removeChild(modalBody.firstChild);
  modalBody.appendChild(detailsNode);

  // replace footer buttons using DOM
  while (modalFooter.firstChild) modalFooter.removeChild(modalFooter.firstChild);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-secondary';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', closeModal);

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-primary';
  editBtn.textContent = 'Edit Event';
  editBtn.addEventListener('click', () => editEvent(eventId));

  modalFooter.appendChild(closeBtn);
  modalFooter.appendChild(editBtn);

  // Open modal using .active class
  const modalContainer = document.getElementById('modalContainer');
  modalContainer.classList.add('active');
  modalContainer.style.display = 'flex';
}

/**
 * Edit event
 */
function editEvent(eventId) {
  editingEventId = eventId;
  openEventModal('Edit Event');
}

/**
 * Delete event
 */
async function deleteEvent(eventId) {
  // Use app modal confirm instead of native confirm dialog
  ModalService.confirm(
    'Delete Event',
    'Are you sure you want to delete this event?',
    async () => {
      try {
        const result = await EventService.deleteEvent(eventId);
        if (result.success) {
          ModalService.showSuccess('Event deleted successfully!');
          await loadEvents();
        } else {
          showErrorMessage(result.error || 'Failed to delete event');
        }
      } catch (error) {
        console.error('❌ Error deleting event:', error);
        showErrorMessage('Error deleting event');
      }
    }
  );
}

/**
 * Close modal and reload events
 */
async function closeModalAndReload() {
  closeModal();
  await loadEvents();
}

/**
 * Close modal
 */
function closeModal() {
  const modalContainer = document.getElementById('modalContainer');
  modalContainer.classList.remove('active');
  modalContainer.style.display = 'none';
  editingEventId = null;
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

/**
 * Convert a 24-hour `HH:MM` time string to 12-hour format like `7:00 PM`.
 */
function formatTimeTo12Hour(time24) {
  if (!time24) return '';
  // Ensure we have HH:MM
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

/**
 * Return a human readable time or range. If end is missing or equal to start, return single time.
 */
function formatTimeRange(start24, end24) {
  const start = formatTimeTo12Hour(start24);
  const end = formatTimeTo12Hour(end24);
  if (!start) return '';
  if (!end || start24 === end24) return start;
  return `${start} - ${end}`;
}

/**
 * Return avatar URL: use photoURL if available, otherwise generate initials avatar
 */
function avatarUrl(name, photoUrl) {
  if (photoUrl) return photoUrl;
  const display = name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(display)}&background=3498db&color=fff&size=128`;
}

/**
 * Format date and time
 */
function formatDateTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US');
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  console.log(message);
  ModalService.showSuccess(message);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
  console.error(message);
  // Use ModalService to show error with proper button configuration
  ModalService.showError(message);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export functions globally for use in HTML onclick handlers and PageService
window.loadEvents = loadEvents;
window.openCreateEventModal = openCreateEventModal;
window.viewEvent = viewEvent;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.closeModal = closeModal;
window.closeModalAndReload = closeModalAndReload;

// Export saveEvent for HTML onclick
window.saveEvent = saveEvent;

// Listen for modal close events dispatched by the modal helper and reload if requested
document.addEventListener('modalClosed', (e) => {
  try {
    const shouldReload = e?.detail?.shouldReload;
    if (shouldReload) {
      // schedule async reload to avoid blocking the UI thread during close
      setTimeout(() => {
        loadEvents();
      }, 0);
    }
  } catch (err) {
    console.warn('events: error handling modalClosed event', err);
  }
});