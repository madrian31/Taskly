import HolidayService from './HolidayService.js';
import EventService from '../../Services/EventService.js';
import ModalService from './ModalService.js';

// Convert 'HH:MM' or 'HH:MM:SS' to 12-hour format like '7:00 PM'
function formatTo12(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let hh = parseInt(parts[0], 10);
  const mm = parts[1] || '00';
  if (Number.isNaN(hh)) return timeStr;
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${mm} ${ampm}`;
}

// Initialize Flatpickr calendar with holiday and event marks + event counts
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Get holidays for current year with names
    const holidays = await HolidayService.getHolidays().catch(() => []);
    const holidayMap = {};
    (holidays || []).forEach(holiday => { holidayMap[holiday.date] = holiday.name; });
    const holidayDates = Object.keys(holidayMap);

    // Fetch events and index by date (for counts and quick lookup on click)
    const eventCountByDate = {};
    const eventsByDate = {};
    try {
      const evRes = await EventService.getAllEvents();
      if (evRes && evRes.success && Array.isArray(evRes.data)) {
        evRes.data.forEach(ev => {
          if (!ev.startDate) return;
          const d = ev.startDate;
          eventCountByDate[d] = (eventCountByDate[d] || 0) + 1;
          eventsByDate[d] = eventsByDate[d] || [];
          eventsByDate[d].push(ev);
        });
      }
    } catch (e) {
      console.warn('Could not fetch events for calendar', e);
    }

    flatpickr('#calendarContainer', {
      inline: true,
      defaultDate: new Date(),
      monthSelectorType: 'dropdown',
      onDayCreate: function(dObj, dStr, fp, dayElem) {
        // Build YYYY-MM-DD string from day element
        const date = dayElem.dateObj;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Holiday mark
        if (holidayDates.includes(dateStr)) {
          dayElem.classList.add('holiday');
          dayElem.style.color = '#ff6b6b';
          dayElem.style.fontWeight = 'bold';
          dayElem.title = `🎉 ${holidayMap[dateStr]}`;
        }

        // Event count display
        const eventCount = eventCountByDate[dateStr] || 0;
        if (eventCount > 0) {
          dayElem.classList.add('has-event');
          // Create event count badge
          const countBadge = document.createElement('span');
          countBadge.className = 'event-count-badge';
          countBadge.textContent = eventCount;
          dayElem.appendChild(countBadge);
        }

        // Add modern minimalist tooltip on hover
        try {
          const hasHoliday = holidayDates.includes(dateStr);
          const evs = eventsByDate[dateStr] || [];
          
          if (hasHoliday || evs.length > 0) {
            let tooltipEl = null;
            
            dayElem.addEventListener('mouseenter', (e) => {
              // Create tooltip element
              tooltipEl = document.createElement('div');
              tooltipEl.className = 'calendar-tooltip';
              
              // Add holiday section
              if (hasHoliday) {
                const holidayDiv = document.createElement('div');
                holidayDiv.className = 'tooltip-holiday';
                holidayDiv.innerHTML = `<i class="fas fa-star"></i><span>${holidayMap[dateStr]}</span>`;
                tooltipEl.appendChild(holidayDiv);
              }
              
              // Add events section
              if (evs.length > 0) {
                const eventsDiv = document.createElement('div');
                eventsDiv.className = 'tooltip-events';
                
                evs.forEach(ev => {
                  const eventItem = document.createElement('div');
                  eventItem.className = 'tooltip-event-item';
                  eventItem.innerHTML = `<i class="fas fa-circle"></i><span>${ev.title || 'Untitled Event'}</span>`;
                  eventsDiv.appendChild(eventItem);
                });
                
                tooltipEl.appendChild(eventsDiv);
              }
              
              document.body.appendChild(tooltipEl);
              
              // Position tooltip
              const rect = dayElem.getBoundingClientRect();
              const tooltipRect = tooltipEl.getBoundingClientRect();
              const left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
              const top = rect.top - tooltipRect.height - 12;
              
              tooltipEl.style.left = `${Math.max(10, left)}px`;
              tooltipEl.style.top = `${top}px`;
              
              // Show tooltip with animation
              requestAnimationFrame(() => {
                tooltipEl.classList.add('show');
              });
            });
            
            dayElem.addEventListener('mouseleave', () => {
              if (tooltipEl) {
                tooltipEl.classList.remove('show');
                setTimeout(() => {
                  if (tooltipEl && tooltipEl.parentNode) {
                    tooltipEl.parentNode.removeChild(tooltipEl);
                  }
                }, 200);
              }
            });
          }
        } catch (e) {
          // Do not block calendar rendering if tooltip building fails
          console.warn('Could not build calendar day tooltip', e);
        }

        // always allow clicking a day to view events (empty state if none)
        dayElem.style.cursor = 'pointer';
        dayElem.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const items = eventsByDate[dateStr] || [];

          const container = document.createElement('div');
          container.className = 'calendar-events-list';

          // Date header inside body with gradient and icon
          const header = document.createElement('div');
          header.className = 'calendar-events-modal-header';
          header.style.background = 'linear-gradient(90deg, rgba(34,193,195,0.12), rgba(253,187,45,0.12))';

          const icon = document.createElement('div');
          icon.className = 'cal-icon';
          icon.innerHTML = '<i class="fas fa-calendar-alt"></i>';

          const dateTxt = document.createElement('div');
          dateTxt.className = 'cal-date';
          // show human-readable date
          try {
            const d = new Date(dateStr + 'T00:00:00');
            const opts = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            dateTxt.textContent = d.toLocaleDateString(undefined, opts);
          } catch (e) {
            dateTxt.textContent = dateStr;
          }

          header.appendChild(icon);
          header.appendChild(dateTxt);
          container.appendChild(header);

          if (!items || items.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'calendar-events-empty';
            empty.innerHTML = '<div style="font-size:20px;margin-bottom:8px">No events</div><div>Walang naka-schedule na event para sa araw na ito.</div>';
            container.appendChild(empty);
          } else {
            items.forEach(it => {
              const card = document.createElement('div');
              card.className = 'calendar-event-card';

              const iconWrap = document.createElement('div');
              iconWrap.className = 'event-icon';
              // set color and icon by type
              const type = (it.eventType || 'Other').toLowerCase();
              let iconClass = 'fas fa-calendar';
              let typeClass = 'type-other';
              switch (type) {
                case 'meeting': iconClass = 'fas fa-users'; typeClass = 'type-meeting'; break;
                case 'birthday': iconClass = 'fas fa-birthday-cake'; typeClass = 'type-birthday'; break;
                case 'holiday': iconClass = 'fas fa-umbrella-beach'; typeClass = 'type-holiday'; break;
                case 'task': iconClass = 'fas fa-tasks'; typeClass = 'type-task'; break;
                case 'appointment': iconClass = 'fas fa-calendar-check'; typeClass = 'type-appointment'; break;
                case 'reminder': iconClass = 'fas fa-bell'; typeClass = 'type-reminder'; break;
                default: iconClass = 'fas fa-calendar'; typeClass = 'type-other';
              }
              iconWrap.classList.add(typeClass);
              iconWrap.innerHTML = `<i class="${iconClass}"></i>`;

              const main = document.createElement('div');
              main.className = 'event-main';

              const h = document.createElement('h4');
              h.textContent = it.title || 'Untitled Event';

              const meta = document.createElement('div');
              meta.className = 'calendar-event-meta';

              const timeSpan = document.createElement('div');
              const timeText = it.isAllDay ? 'All Day' : (it.startTime ? `${formatTo12(it.startTime)}${it.endTime ? ' - ' + formatTo12(it.endTime) : ''}` : '');
              timeSpan.innerHTML = `<span class="meta-icon"><i class="fas fa-clock"></i></span>${timeText}`;

              meta.appendChild(timeSpan);

              if (it.location) {
                const loc = document.createElement('div');
                loc.className = 'calendar-event-location';
                loc.innerHTML = `<span class="meta-icon"><i class="fas fa-map-marker-alt"></i></span>${it.location}`;
                meta.appendChild(loc);
              }

              const desc = document.createElement('p');
              desc.textContent = it.description || '';
              desc.style.margin = '8px 0 0 0';

              const badge = document.createElement('div');
              badge.className = 'event-type-badge ' + typeClass;
              badge.textContent = it.eventType || 'Other';

              main.appendChild(h);
              main.appendChild(meta);
              if (it.description) main.appendChild(desc);

              // right-side: badge
              const right = document.createElement('div');
              right.style.marginLeft = '12px';
              right.appendChild(badge);

              card.appendChild(iconWrap);
              card.appendChild(main);
              card.appendChild(right);

              container.appendChild(card);
            });
          }

          ModalService.open({
            title: '',
            body: container,
            confirmText: 'Close',
            showCancel: false
          });
        });
      }
    });

    console.log('✅ Calendar initialized with holiday and event marks');
  } catch (error) {
    console.error('❌ Error initializing calendar with holidays/events:', error);
    // Fallback: Initialize calendar without marks
    flatpickr('#calendarContainer', {
      inline: true,
      defaultDate: new Date(),
      monthSelectorType: 'dropdown'
    });
  }
});
