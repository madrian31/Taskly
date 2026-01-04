// tasks.js - Clean modern design matching React component
import { database, auth } from '../../firebaseInit.js';
import { ref, push, set, onValue, update, remove, get } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js';
import { AuthService } from './auth.js';
import UserService from '../../Services/UserService.js';
import { getAvatarUrl } from './UtilsService.js';

let taskForm, taskTitleInput, taskDescriptionInput, tasksList;
const aggregatedTasks = {};
const userCache = {};
let modalConfirmCallback = null;

function showModal(title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm) {
  const modal = document.getElementById('modalContainer');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const confirmBtn = document.getElementById('modalConfirmBtn');
  const cancelBtn = document.getElementById('modalCancelBtn');
  const closeBtn = document.getElementById('modalClose');

  modalTitle.textContent = title;
  // allow passing either HTML string or DOM node
  modalBody.innerHTML = '';
  if (body instanceof Node) {
    modalBody.appendChild(body);
  } else if (typeof body === 'string') {
    modalBody.innerHTML = body;
  }
  confirmBtn.textContent = confirmLabel;
  cancelBtn.textContent = cancelLabel;
  modalConfirmCallback = onConfirm;

  modal.classList.add('active');

  const newConfirmBtn = confirmBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  const newCloseBtn = closeBtn.cloneNode(true);
  
  confirmBtn.replaceWith(newConfirmBtn);
  cancelBtn.replaceWith(newCancelBtn);
  closeBtn.replaceWith(newCloseBtn);

  const confirmBtnNew = document.getElementById('modalConfirmBtn');
  const cancelBtnNew = document.getElementById('modalCancelBtn');
  const closeBtnNew = document.getElementById('modalClose');

  confirmBtnNew.addEventListener('click', () => {
    if (modalConfirmCallback) modalConfirmCallback();
    modal.classList.remove('active');
  });

  cancelBtnNew.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  closeBtnNew.addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

async function ensureOwnerInfo(uid) {
  if (!uid) return { display: '' };
  if (userCache[uid]) return userCache[uid];
  try {
    const u = await UserService.getUserById(uid);
    const display = u ? (u.name || u.email || uid) : uid;
    userCache[uid] = { raw: u, display };
    return userCache[uid];
  } catch (err) {
    userCache[uid] = { raw: null, display: uid };
    return userCache[uid];
  }
}

export function initTasksPage() {
  taskForm = document.getElementById('taskForm');
  taskTitleInput = document.getElementById('taskTitle');
  taskDescriptionInput = document.getElementById('taskDescription');
  const taskTargetDateInput = document.getElementById('taskTargetDate');
  const taskRecurrenceSelect = document.getElementById('taskRecurrence');
  const taskRecurrenceInterval = document.getElementById('taskRecurrenceInterval');
  tasksList = document.getElementById('tasksList');

  if (!taskForm) return;

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    const desc = taskDescriptionInput.value.trim();
    const targetDate = taskTargetDateInput ? taskTargetDateInput.value : null;
    const recurrence = taskRecurrenceSelect ? taskRecurrenceSelect.value : 'none';
    const recurrenceInterval = taskRecurrenceInterval ? Math.max(1, parseInt(taskRecurrenceInterval.value||1)) : 1;
    const created = await addTask(title, desc, targetDate);
    if (created && recurrence !== 'none') {
      const nextDue = computeNextDueFrom({ type: recurrence, interval: recurrenceInterval }, targetDate || new Date().toISOString());
      const taskRef = ref(database, `tasks/${auth.currentUser.uid}/${created}`);
      await update(taskRef, { recurrence: { type: recurrence, interval: recurrenceInterval }, nextDue });
    }
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
    if (taskTargetDateInput) taskTargetDateInput.value = '';
    if (taskRecurrenceSelect) taskRecurrenceSelect.value = 'none';
    if (taskRecurrenceInterval) taskRecurrenceInterval.value = '1';
  });

  AuthService.onAuthStateChanged((user) => {
    if (user) {
      listenToTasks(user.uid);
      listenToCollaborations(user.uid);
    } else if (tasksList) {
      tasksList.innerHTML = '<p>Please sign in to see your tasks.</p>';
    }
  });
}

async function addTask(title, description, targetDate) {
  if (!title) return;
  const user = auth.currentUser;
  if (!user) return alert('Please sign in to add tasks.');

  const tasksRef = ref(database, `tasks/${user.uid}`);
  const newTaskRef = push(tasksRef);
  const taskData = {
    id: newTaskRef.key,
    title,
    description: description || '',
    completed: false,
    targetDate: targetDate || null,
    recurrence: { type: 'none', interval: 1 },
    nextDue: null,
    createdAt: Date.now()
  };

  await set(newTaskRef, taskData);
  return newTaskRef.key;
}

function computeNextDueFrom(recurrence, fromIso) {
  if (!recurrence || recurrence.type === 'none') return null;
  const from = fromIso ? new Date(fromIso) : new Date();
  const interval = recurrence.interval || 1;
  let next = new Date(from.getTime());

  if (recurrence.type === 'daily') {
    next.setDate(next.getDate() + interval);
  } else if (recurrence.type === 'weekly') {
    next.setDate(next.getDate() + 7 * interval);
  } else if (recurrence.type === 'monthly') {
    const day = next.getDate();
    next.setMonth(next.getMonth() + interval);
    if (next.getDate() !== day) {
      next.setDate(0);
    }
  }

  return next.toISOString().split('T')[0];
}

function listenToTasks(uid) {
  const userTasksRef = ref(database, `tasks/${uid}`);
  onValue(userTasksRef, async (snapshot) => {
    const data = snapshot.val() || {};
    Object.keys(aggregatedTasks).forEach(k => {
      if (k.startsWith(uid + '_')) delete aggregatedTasks[k];
    });

    await ensureOwnerInfo(uid);

    Object.keys(data).forEach(taskId => {
      const task = data[taskId];
      aggregatedTasks[`${uid}_${taskId}`] = { ...(task || {}), _owner: uid, _taskId: taskId, _ownerDisplay: userCache[uid] ? userCache[uid].display : uid };
    });
    renderAggregatedTasks();
  });
}

function listenToCollaborations(uid) {
  const collabRef = ref(database, `userTasks/${uid}`);
  onValue(collabRef, async (snapshot) => {
    const mapping = snapshot.val() || {};

    const fetches = [];
    Object.keys(mapping).forEach(ownerUid => {
      const tasksForOwner = mapping[ownerUid] || {};
      Object.keys(tasksForOwner).forEach(taskId => {
        fetches.push((async () => {
          const snap = await get(ref(database, `tasks/${ownerUid}/${taskId}`));
          if (snap && snap.exists && snap.exists()) {
            const task = snap.val();
            await ensureOwnerInfo(ownerUid);
            aggregatedTasks[`${ownerUid}_${taskId}`] = { ...(task || {}), _owner: ownerUid, _taskId: taskId, _ownerDisplay: userCache[ownerUid] ? userCache[ownerUid].display : ownerUid };
          } else {
            await remove(ref(database, `userTasks/${uid}/${ownerUid}/${taskId}`));
          }
        })());
      });
    });

    await Promise.all(fetches);
    renderAggregatedTasks();
  });
}

function renderAggregatedTasks() {
  const tasksObj = {};
  Object.keys(aggregatedTasks).forEach(k => {
    tasksObj[k] = aggregatedTasks[k];
  });
  renderTasks(tasksObj, auth.currentUser ? auth.currentUser.uid : null);
}

function renderTasks(tasks, uid) {
  tasksList.innerHTML = '';
  const keys = Object.keys(tasks).sort((a,b)=> (tasks[b].createdAt||0) - (tasks[a].createdAt||0));

  if (keys.length === 0) {
    const noTpl = document.getElementById('tpl-no-tasks');
    if (noTpl) {
      tasksList.appendChild(noTpl.content.cloneNode(true));
    } else {
      const noDiv = document.createElement('div');
      noDiv.className = 'no-tasks';
      const icon = document.createElement('i');
      icon.className = 'fas fa-clipboard-list fa-3x';
      const p = document.createElement('p');
      p.textContent = 'No tasks yet. Add your first task!';
      noDiv.appendChild(icon);
      noDiv.appendChild(p);
      tasksList.appendChild(noDiv);
    }
    return;
  }

  keys.forEach(async (taskKey) => {
    const task = tasks[taskKey];
    const parts = taskKey.split('_');
    const ownerUid = task._owner || parts[0];
    const localTaskId = task._taskId || parts.slice(1).join('_');
    const currentUid = auth.currentUser ? auth.currentUser.uid : null;
    const isOwner = currentUid === ownerUid;
    const ownerDisplay = task._ownerDisplay || (userCache[ownerUid] ? userCache[ownerUid].display : ownerUid);

    const subtaskKeys = task.subtasks ? Object.keys(task.subtasks) : [];
    const totalSubtasks = subtaskKeys.length;
    const doneSubtasks = subtaskKeys.filter(k => task.subtasks[k] && task.subtasks[k].completed).length;
    const progressPct = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;

    const collabIds = task.collaborators ? Object.keys(task.collaborators) : [];
    
    for (const cid of collabIds) {
      if (!userCache[cid]) {
        await ensureOwnerInfo(cid);
      }
    }

    const ownerPhoto = getAvatarUrl(userCache[ownerUid]?.raw?.photoURL, ownerDisplay, 24);

    const taskEl = document.createElement('div');
    taskEl.className = 'task-item' + (task.completed ? ' completed' : '');
    taskEl.dataset.owner = ownerUid;
    taskEl.dataset.scope = isOwner ? 'mine' : 'shared';

    // Use template for task card when available to keep markup in HTML
    const cardTpl = document.getElementById('tpl-task-card');
    if (cardTpl) {
      const frag = cardTpl.content.cloneNode(true);
      const card = frag.querySelector('.task-card');

      const checkbox = card.querySelector('.task-checkbox');
      checkbox.dataset.owner = ownerUid;
      checkbox.dataset.taskid = localTaskId;
      checkbox.checked = !!task.completed;

      const titleEl = card.querySelector('.task-title');
      titleEl.textContent = task.title || '';

      const descEl = card.querySelector('.task-description');
      if (task.description) {
        descEl.textContent = task.description;
      } else {
        descEl.remove();
      }

      // owner
      const ownerImg = card.querySelector('.owner-photo');
      const ownerName = card.querySelector('.owner-name');
      ownerImg.src = ownerPhoto;
      ownerImg.alt = ownerDisplay;
      ownerName.textContent = ownerDisplay;

      // progress
      const progressCount = card.querySelector('.progress-count');
      const progressFill = card.querySelector('.progress-fill');
      progressCount.textContent = `${doneSubtasks}/${totalSubtasks}`;
      progressFill.style.width = `${progressPct}%`;

      // due date
      const dueBtn = card.querySelector('.due-date-btn');
      if (dueBtn) {
        if (task.targetDate) {
          dueBtn.textContent = task.targetDate;
        } else {
          dueBtn.textContent = 'Set due date';
        }
      }

      // collaborators (avatars)
      const avatarsEl = card.querySelector('.collaborators-avatars');
      avatarsEl.innerHTML = '';
      collabIds.slice(0,5).forEach((cid, i) => {
        const displayName = cid === currentUid ? 'You' : (userCache[cid]?.display || cid.substring(0,10));
        const photo = getAvatarUrl(userCache[cid]?.raw?.photoURL, displayName, 36);
        const colors = ['pink','teal','blue','purple','green'];
        const colorClass = colors[i % colors.length];
        const div = document.createElement('div');
        div.className = `collaborator-avatar ${colorClass}`;
        div.title = displayName;
        const img = document.createElement('img');
        img.src = photo;
        img.alt = displayName;
        img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover'; img.style.borderRadius = '9999px';
        div.appendChild(img);
        if (isOwner) {
          const btn = document.createElement('button');
          btn.className = 'remove-collab-x';
          btn.dataset.owner = ownerUid;
          btn.dataset.taskid = localTaskId;
          btn.dataset.collab = cid;
          btn.innerHTML = '<i class="fas fa-times"></i>';
          div.appendChild(btn);
        }
        avatarsEl.appendChild(div);
      });

      // menu (if owner)
      const menuPlaceholder = card.querySelector('.task-menu-placeholder');
      if (isOwner) {
        const menuButton = document.createElement('button');
        menuButton.className = 'task-menu-button';
        menuButton.dataset.menuId = `menu-${taskKey}`;
        const ellI = document.createElement('i');
        ellI.className = 'fas fa-ellipsis-v';
        menuButton.appendChild(ellI);
        const dropdown = document.createElement('div');
        dropdown.className = 'task-menu-dropdown';
        dropdown.id = `menu-${taskKey}`;
        const delBtn = document.createElement('button');
        delBtn.className = 'task-menu-item danger';
        delBtn.dataset.action = 'delete';
        delBtn.dataset.owner = ownerUid;
        delBtn.dataset.taskid = localTaskId;
        delBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Task';
        delBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const delTplInner = document.getElementById('tpl-delete-confirm');
          let bodyNodeInner = null;
          if (delTplInner) {
            const fragInner = delTplInner.content.cloneNode(true);
            const containerInner = fragInner.querySelector('.delete-confirm-body');
            const line1Inner = containerInner.querySelector('.delete-line1');
            line1Inner.textContent = 'Are you sure you want to delete ';
            const strongInner = document.createElement('strong');
            strongInner.textContent = task.title || '';
            line1Inner.appendChild(strongInner);
            line1Inner.appendChild(document.createTextNode('?'));
            bodyNodeInner = containerInner;
          } else {
            const divInner = document.createElement('div');
            const p1Inner = document.createElement('p');
            p1Inner.style.fontSize = '15px';
            p1Inner.style.color = '#495057';
            p1Inner.appendChild(document.createTextNode('Are you sure you want to delete '));
            const strongInner = document.createElement('strong');
            strongInner.textContent = task.title || '';
            p1Inner.appendChild(strongInner);
            p1Inner.appendChild(document.createTextNode('?'));
            const p2Inner = document.createElement('p');
            p2Inner.style.fontSize = '13px';
            p2Inner.style.color = '#888';
            p2Inner.textContent = 'This action cannot be undone.';
            divInner.appendChild(p1Inner);
            divInner.appendChild(p2Inner);
            bodyNodeInner = divInner;
          }

          showModal(
            'Delete Task',
            bodyNodeInner,
            'Delete',
            'Cancel',
            async () => {
              await deleteTask(ownerUid, localTaskId);
            }
          );
        });
        dropdown.appendChild(delBtn);
        menuButton.appendChild(dropdown);
        menuPlaceholder.appendChild(menuButton);
      }

      taskEl.appendChild(card);
    } else {
      // fallback: minimal DOM structure if template missing
      const header = document.createElement('div');
      header.className = 'task-card-header';
      const row = document.createElement('div');
      row.className = 'task-header-row';
      const left = document.createElement('div');
      left.className = 'task-header-left';
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = 'task-checkbox';
      chk.dataset.owner = ownerUid;
      chk.dataset.taskid = localTaskId;
      const content = document.createElement('div');
      content.className = 'task-header-content';
      const h2 = document.createElement('h2');
      h2.className = 'task-title';
      h2.textContent = task.title || '';
      content.appendChild(h2);
      left.appendChild(chk);
      left.appendChild(content);
      row.appendChild(left);
      header.appendChild(row);
      taskEl.appendChild(header);
    }

    if (totalSubtasks > 0 || isOwner) {
      const subtasksSection = document.createElement('div');
      subtasksSection.className = 'task-subtasks-section';

      const header = document.createElement('div');
      header.className = 'subtasks-header';
      const titleSpan = document.createElement('span');
      titleSpan.className = 'subtasks-title';
      titleSpan.textContent = 'Subtasks';
      header.appendChild(titleSpan);
      if (totalSubtasks > 0) {
        const countSpan = document.createElement('span');
        countSpan.className = 'subtasks-count';
        countSpan.textContent = `(${doneSubtasks}/${totalSubtasks})`;
        header.appendChild(countSpan);
      }

      const subtasksList = document.createElement('div');
      subtasksList.className = 'subtasks-list';

      const subTpl = document.getElementById('tpl-subtask-item');
      subtaskKeys.forEach(subId => {
        const s = task.subtasks[subId];
        if (subTpl) {
          const subFrag = subTpl.content.cloneNode(true);
          const item = subFrag.querySelector('.subtask-item');
          const input = item.querySelector('.subtask-checkbox');
          const text = item.querySelector('.subtask-text');
          const delBtn = item.querySelector('.delete-subtask');
          input.dataset.owner = ownerUid;
          input.dataset.taskid = localTaskId;
          input.dataset.subid = subId;
          input.checked = !!s.completed;
          if (s.completed) text.classList.add('completed');
          text.textContent = s.title || '';
          if (!isOwner) delBtn.remove();
          else {
            delBtn.dataset.owner = ownerUid;
            delBtn.dataset.taskid = localTaskId;
            delBtn.dataset.subid = subId;
          }
          subtasksList.appendChild(item);
        } else {
          const div = document.createElement('div');
          div.className = 'subtask-item';
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.className = 'subtask-checkbox';
          input.dataset.owner = ownerUid;
          input.dataset.taskid = localTaskId;
          input.dataset.subid = subId;
          if (s.completed) input.checked = true;
          const span = document.createElement('span');
          span.className = 'subtask-text' + (s.completed ? ' completed' : '');
          span.textContent = s.title || '';
          div.appendChild(input);
          div.appendChild(span);
          if (isOwner) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-subtask';
            delBtn.dataset.owner = ownerUid;
            delBtn.dataset.taskid = localTaskId;
            delBtn.dataset.subid = subId;
            const ix = document.createElement('i');
            ix.className = 'fas fa-times';
            delBtn.appendChild(ix);
            div.appendChild(delBtn);
          }
          subtasksList.appendChild(div);
        }
      });

      if (isOwner) {
        const addBtn = document.createElement('button');
        addBtn.className = 'subtask-add-toggle';
        addBtn.dataset.taskKey = taskKey;
        const plusI = document.createElement('i');
        plusI.className = 'fas fa-plus';
        addBtn.appendChild(plusI);
        addBtn.appendChild(document.createTextNode(' Add subtask'));
        subtasksSection.appendChild(header);
        subtasksSection.appendChild(subtasksList);
        subtasksSection.appendChild(addBtn);
      } else {
        subtasksSection.appendChild(header);
        subtasksSection.appendChild(subtasksList);
      }
      
      if (subtasksList) {
        subtasksList.addEventListener('change', async (e) => {
          const cb = e.target.closest('.subtask-checkbox');
          if (!cb) return;
          const owner = cb.dataset.owner;
          const taskId = cb.dataset.taskid;
          const subId = cb.dataset.subid;
          const completed = cb.checked;
          
          await toggleSubtask(owner, taskId, subId, completed);
          
          const taskKey = `${owner}_${taskId}`;
          if (aggregatedTasks[taskKey] && aggregatedTasks[taskKey].subtasks && aggregatedTasks[taskKey].subtasks[subId]) {
            aggregatedTasks[taskKey].subtasks[subId].completed = completed;
          }
          
          renderAggregatedTasks();
        });

        subtasksList.addEventListener('click', async (e) => {
          const btn = e.target.closest('.delete-subtask');
          if (!btn) return;
          await deleteSubtask(btn.dataset.owner, btn.dataset.taskid, btn.dataset.subid);
        });
      }

      const addToggle = subtasksSection.querySelector('.subtask-add-toggle');
      if (addToggle) {
        addToggle.addEventListener('click', (e) => {
          const button = e.currentTarget;
          const tpl = document.getElementById('tpl-subtask-add-form');
          if (tpl) {
            const frag = tpl.content.cloneNode(true);
            const inputEl = frag.querySelector('input');
            inputEl.dataset.owner = ownerUid;
            inputEl.dataset.taskid = localTaskId;
            button.parentNode.insertBefore(frag, button);
            button.style.display = 'none';
          } else {
            const formDiv = document.createElement('div');
            formDiv.className = 'subtask-add-form';
            const inputEl = document.createElement('input');
            inputEl.type = 'text';
            inputEl.placeholder = 'Enter subtask name...';
            inputEl.dataset.owner = ownerUid;
            inputEl.dataset.taskid = localTaskId;
            const addBtnEl = document.createElement('button');
            addBtnEl.className = 'subtask-add-btn';
            addBtnEl.textContent = 'Add';
            const cancelBtnEl = document.createElement('button');
            cancelBtnEl.className = 'subtask-cancel-btn';
            cancelBtnEl.textContent = 'Cancel';
            formDiv.appendChild(inputEl);
            formDiv.appendChild(addBtnEl);
            formDiv.appendChild(cancelBtnEl);
            button.parentNode.insertBefore(formDiv, button);
            button.style.display = 'none';
          }

          const form = subtasksSection.querySelector('.subtask-add-form');
          const input = form.querySelector('input');
          const addBtn = form.querySelector('.subtask-add-btn');
          const cancelBtn = form.querySelector('.subtask-cancel-btn');
          
          input.focus();
          
          addBtn.addEventListener('click', async () => {
            const title = input.value.trim();
            if (!title) return;
            await addSubtask(ownerUid, localTaskId, title);
            form.remove();
            button.style.display = '';
          });
          
          cancelBtn.addEventListener('click', () => {
            form.remove();
            button.style.display = '';
          });
          
          input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              addBtn.click();
            }
          });
        });
      }

      taskEl.appendChild(subtasksSection);
    }

    // Setup "+Add" collaborator button in the card header
    if (isOwner) {
      const collabAddBtn = taskEl.querySelector('.collab-add-btn');
      if (collabAddBtn) {
        collabAddBtn.addEventListener('click', async () => {
          // Build modal body with user dropdown
          const modalDiv = document.createElement('div');
          modalDiv.className = 'add-collab-modal-body';
          
          const select = document.createElement('select');
          select.className = 'collab-select-dropdown';
          select.style.cssText = 'width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;';
          const defaultOpt = document.createElement('option');
          defaultOpt.value = '';
          defaultOpt.textContent = 'Select user to add...';
          select.appendChild(defaultOpt);
          
          try {
            const users = await UserService.getAllUsers();
            users.filter(u => u.isAccountActive !== false && u.id !== uid && !collabIds.includes(u.id)).forEach(u => {
              const opt = document.createElement('option');
              opt.value = u.id;
              opt.textContent = u.name || u.email || ('User ' + u.id);
              select.appendChild(opt);
            });
          } catch (err) {
            console.warn('Failed to load users', err);
          }
          
          modalDiv.appendChild(select);
          
          showModal(
            'Add Collaborator',
            modalDiv,
            'Add',
            'Cancel',
            async () => {
              const selectedUid = select.value;
              if (!selectedUid) return alert('Please select a user.');
              await addCollaborator(ownerUid, localTaskId, selectedUid);
            }
          );
        });
      }
    }

    const taskCheckbox = taskEl.querySelector('.task-checkbox');
    taskCheckbox.addEventListener('change', async (e) => {
      const checked = e.target.checked;
      await toggleTask(ownerUid, localTaskId, checked);
      
      const taskKey = `${ownerUid}_${localTaskId}`;
      if (aggregatedTasks[taskKey]) {
        aggregatedTasks[taskKey].completed = checked;
      }
      
      renderAggregatedTasks();
    });

    const menuButton = taskEl.querySelector('.task-menu-button');
    if (menuButton) {
      menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuId = menuButton.dataset.menuId;
        const dropdown = document.getElementById(menuId);
        
        document.querySelectorAll('.task-menu-dropdown.active').forEach(d => {
          if (d.id !== menuId) d.classList.remove('active');
        });
        
        dropdown.classList.toggle('active');
      });
    }

    taskEl.addEventListener('click', (e) => {
      // Handle remove collaborator button
      const removeBtn = e.target.closest('.remove-collab-x');
      if (removeBtn) {
        e.stopPropagation();
        const body = document.createElement('div');
        const p = document.createElement('p');
        p.style.fontSize = '15px';
        p.style.color = '#495057';
        p.textContent = 'Remove this collaborator?';
        body.appendChild(p);

        showModal(
          'Remove Collaborator',
          body,
          'Remove',
          'Cancel',
          async () => {
            await removeCollaborator(removeBtn.dataset.owner, removeBtn.dataset.taskid, removeBtn.dataset.collab);
            renderAggregatedTasks();
          }
        );
        return;
      }

      // Handle delete task menu item
      const menuItem = e.target.closest('.task-menu-item');
      if (!menuItem) return;
      
      const action = menuItem.dataset.action;
      if (action === 'delete') {
        const delTpl = document.getElementById('tpl-delete-confirm');
        let bodyNode = null;
        if (delTpl) {
          const frag = delTpl.content.cloneNode(true);
          const container = frag.querySelector('.delete-confirm-body');
          const line1 = container.querySelector('.delete-line1');
          // build: Are you sure you want to delete <strong>title</strong>?
          line1.textContent = 'Are you sure you want to delete ';
          const strong = document.createElement('strong');
          strong.textContent = task.title || '';
          line1.appendChild(strong);
          line1.appendChild(document.createTextNode('?'));
          bodyNode = container;
        } else {
          const div = document.createElement('div');
          const p1 = document.createElement('p');
          p1.style.fontSize = '15px';
          p1.style.color = '#495057';
          p1.appendChild(document.createTextNode('Are you sure you want to delete '));
          const strong = document.createElement('strong');
          strong.textContent = task.title || '';
          p1.appendChild(strong);
          p1.appendChild(document.createTextNode('?'));
          const p2 = document.createElement('p');
          p2.style.fontSize = '13px';
          p2.style.color = '#888';
          p2.textContent = 'This action cannot be undone.';
          div.appendChild(p1);
          div.appendChild(p2);
          bodyNode = div;
        }

        showModal(
          'Delete Task',
          bodyNode,
          'Delete',
          'Cancel',
          async () => {
            await deleteTask(menuItem.dataset.owner, menuItem.dataset.taskid);
          }
        );
      }
    });

    tasksList.appendChild(taskEl);
  });

  applyTaskFilter();
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.task-menu-button') && !e.target.closest('.task-menu-item')) {
    document.querySelectorAll('.task-menu-dropdown.active').forEach(d => {
      d.classList.remove('active');
    });
  }
});

function applyTaskFilter() {
  const active = document.querySelector('.tabs .tab.active');
  const tab = active ? active.dataset.tab : 'mine';
  const cards = document.querySelectorAll('.task-item');
  const currentUid = auth.currentUser ? auth.currentUser.uid : null;
  cards.forEach(c => {
    if (!currentUid) { c.style.display = 'none'; return; }
    if (tab === 'mine') {
      c.style.display = (c.dataset.owner === currentUid) ? '' : 'none';
    } else {
      c.style.display = (c.dataset.owner !== currentUid) ? '' : 'none';
    }
  });
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('.tabs .tab');
  if (!t) return;
  document.querySelectorAll('.tabs .tab').forEach(b => b.classList.remove('active'));
  t.classList.add('active');
  applyTaskFilter();
});

async function addSubtask(uid, taskId, title) {
  const subRef = push(ref(database, `tasks/${uid}/${taskId}/subtasks`));
  const data = { id: subRef.key, title, completed: false, createdAt: Date.now() };
  await set(subRef, data);
}

async function addCollaborator(ownerUid, taskId, collaboratorUid) {
  if (!ownerUid || !taskId || !collaboratorUid) return;
  const collabRef = ref(database, `tasks/${ownerUid}/${taskId}/collaborators/${collaboratorUid}`);
  await set(collabRef, true);
  const mapRef = ref(database, `userTasks/${collaboratorUid}/${ownerUid}/${taskId}`);
  await set(mapRef, true);
}

async function removeCollaborator(ownerUid, taskId, collaboratorUid) {
  if (!ownerUid || !taskId || !collaboratorUid) return;
  const collabRef = ref(database, `tasks/${ownerUid}/${taskId}/collaborators/${collaboratorUid}`);
  await remove(collabRef);
  const mapRef = ref(database, `userTasks/${collaboratorUid}/${ownerUid}/${taskId}`);
  await remove(mapRef);
}

async function toggleSubtask(uid, taskId, subId, completed) {
  const targetRef = ref(database, `tasks/${uid}/${taskId}/subtasks/${subId}`);
  await update(targetRef, { completed });
}

async function deleteSubtask(uid, taskId, subId) {
  const targetRef = ref(database, `tasks/${uid}/${taskId}/subtasks/${subId}`);
  await remove(targetRef);
}

async function deleteTask(uid, taskId) {
  const targetRef = ref(database, `tasks/${uid}/${taskId}`);
  await remove(targetRef);
}

async function toggleTask(uid, taskId, completed) {
  const targetRef = ref(database, `tasks/${uid}/${taskId}`);
  await update(targetRef, { completed });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"]+/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

document.addEventListener('DOMContentLoaded', () => {
  const pathname = window.location.pathname || '';
  if (pathname.includes('/Views/Tasks/') || pathname.includes('/tasks.html')) {
    initTasksPage();
  }
});

export default {
  initTasksPage,
  addTask
};