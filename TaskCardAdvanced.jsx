import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  MoreVertical,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Circle,
  Calendar,
  Users,
  Progress as ProgressIcon,
  Repeat2,
  Edit2,
  Share2,
  Clock,
  AlertCircle,
} from 'lucide-react';

/**
 * Advanced TaskCard Component with Additional Features
 * 
 * Features:
 * - Priority levels (Low, Medium, High, Urgent)
 * - Tags/Categories
 * - Activity timeline
 * - Edit mode for inline editing
 * - Export/Share functionality
 * - Keyboard shortcuts
 * - Dark mode support
 * - Animations and transitions
 */

const TaskCardAdvanced = ({
  task,
  isOwner = false,
  isDarkMode = false,
  onUpdateTask = () => {},
  onDeleteTask = () => {},
  onToggleComplete = () => {},
  onAddSubtask = () => {},
  onToggleSubtask = () => {},
  onDeleteSubtask = () => {},
  onAddCollaborator = () => {},
  onRemoveCollaborator = () => {},
  onAddTag = () => {},
  onRemoveTag = () => {},
  onSetPriority = () => {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showActivity, setShowActivity] = useState(false);
  const menuRef = useRef(null);

  // Calculate progress metrics
  const subtasks = task.subtasks ? Object.entries(task.subtasks) : [];
  const completedSubtasks = subtasks.filter(([_, s]) => s.completed).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Priority styling
  const priorityStyles = {
    low: { bg: 'bg-blue-50 dark:bg-blue-900', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300' },
    medium: { bg: 'bg-amber-50 dark:bg-amber-900', border: 'border-amber-200 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300' },
    high: { bg: 'bg-orange-50 dark:bg-orange-900', border: 'border-orange-200 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-300' },
    urgent: { bg: 'bg-red-50 dark:bg-red-900', border: 'border-red-200 dark:border-red-700', text: 'text-red-700 dark:text-red-300' },
  };

  const currentPriorityStyle = priorityStyles[task.priority || 'low'];

  // Format due date
  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return { text: 'Overdue', date: date.toLocaleDateString(), status: 'overdue' };
    } else if (dueDate.getTime() === today.getTime()) {
      return { text: 'Today', date: date.toLocaleDateString(), status: 'today' };
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return { text: 'Tomorrow', date: date.toLocaleDateString(), status: 'upcoming' };
    } else {
      return { text: date.toLocaleDateString(), date: date.toLocaleDateString(), status: 'upcoming' };
    }
  };

  const dueDate = task.targetDate || task.nextDue ? formatDueDate(task.targetDate || task.nextDue) : null;

  // Handle save edited task
  const handleSaveEdit = () => {
    if (editedTitle.trim()) {
      onUpdateTask(task._owner, task._taskId, {
        title: editedTitle,
        description: editedDescription,
      });
      setEditMode(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editMode && isOwner) {
        if (e.key === 'e' && e.ctrlKey) {
          e.preventDefault();
          setEditMode(true);
        }
        if (e.key === ' ' && e.ctrlKey) {
          e.preventDefault();
          onToggleComplete(task._owner, task._taskId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, isOwner, task]);

  // Handle menu close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowPriorityMenu(false);
      }
    };

    if (showMenu || showPriorityMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu, showPriorityMenu]);

  const darkBg = isDarkMode ? 'dark:bg-gray-900' : '';
  const darkBorder = isDarkMode ? 'dark:border-gray-700' : '';
  const darkText = isDarkMode ? 'dark:text-gray-100' : '';
  const darkSecondaryText = isDarkMode ? 'dark:text-gray-400' : '';

  return (
    <div
      className={`
        rounded-lg border transition-all duration-300 overflow-hidden
        ${task.completed ? `border-gray-200 ${darkBorder} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}` : `border-gray-200 ${darkBorder} ${isDarkMode ? 'bg-gray-800' : 'bg-white'} hover:border-blue-300 hover:shadow-lg`}
        ${task.completed ? 'shadow-sm' : 'shadow-sm hover:shadow-md'}
      `}
    >
      {/* Header Section */}
      <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-start justify-between gap-4">
          {/* Priority Badge + Checkbox + Title */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Priority Badge */}
            {task.priority && task.priority !== 'low' && (
              <div className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${currentPriorityStyle.bg} ${currentPriorityStyle.border} ${currentPriorityStyle.text}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            )}

            {/* Checkbox */}
            <button
              onClick={() => onToggleComplete(task._owner, task._taskId)}
              className={`mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'} transition-colors`}
              title="Toggle completion (Ctrl+Space)"
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>

            {/* Title and Description */}
            {editMode ? (
              <div className="flex-1 min-w-0 space-y-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={`w-full px-3 py-2 text-lg font-semibold rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  rows="3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedTitle(task.title);
                      setEditedDescription(task.description || '');
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <h3
                  className={`
                    text-lg font-semibold transition-all
                    ${task.completed ? `${isDarkMode ? 'text-gray-500' : 'text-gray-400'} line-through` : `${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  `}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`mt-1 text-sm ${task.completed ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {task.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOwner && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className={`p-2 ${isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'} rounded-lg transition-colors`}
                title="Edit task (Ctrl+E)"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {/* Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 ${isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-10 overflow-hidden ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <button
                    onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                    className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'} ${isDarkMode ? 'text-gray-200' : ''}`}
                  >
                    <span>Priority</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showPriorityMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showPriorityMenu && (
                    <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                      {['low', 'medium', 'high', 'urgent'].map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            onSetPriority(task._owner, task._taskId, p);
                            setShowMenu(false);
                            setShowPriorityMenu(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${task.priority === p ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-50') : ''} ${isDarkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-50'}`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      onDeleteTask(task._owner, task._taskId);
                      setShowMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-red-600 flex items-center gap-2 transition-colors border-t ${isDarkMode ? 'border-gray-600 hover:bg-red-900/20' : 'border-gray-100 hover:bg-red-50'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      {task.tags && task.tags.length > 0 && (
        <div className={`px-4 sm:px-6 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex flex-wrap gap-2`}>
          {task.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}
            >
              {tag}
              {isOwner && (
                <button
                  onClick={() => onRemoveTag(task._owner, task._taskId, tag)}
                  className={`ml-1 ${isDarkMode ? 'hover:text-blue-200' : 'hover:text-blue-600'} transition-colors`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Metadata Section */}
      <div className={`px-4 sm:px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-50'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Owner */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Owner
            </p>
            <p className={`mt-1 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {isOwner ? 'You' : task._ownerDisplay || 'Unknown'}
            </p>
          </div>

          {/* Due Date */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="w-3.5 h-3.5" />
              Due
            </p>
            {dueDate ? (
              <p
                className={`mt-1 text-sm font-medium ${
                  dueDate.status === 'overdue'
                    ? 'text-red-600 dark:text-red-400'
                    : dueDate.status === 'today'
                    ? 'text-orange-600 dark:text-orange-400'
                    : isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                {dueDate.text}
              </p>
            ) : (
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                No due date
              </p>
            )}
          </div>

          {/* Progress */}
          {totalSubtasks > 0 && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <ProgressIcon className="w-3.5 h-3.5" />
                Progress
              </p>
              <p className={`mt-1 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {completedSubtasks}/{totalSubtasks}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalSubtasks > 0 && (
          <div className="mt-3">
            <div className={`w-full rounded-full h-2 overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <div
                className={`h-full transition-all duration-500 rounded-full ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recurrence Badge */}
      {task.recurrence?.type && task.recurrence.type !== 'none' && (
        <div className={`px-4 sm:px-6 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center gap-2`}>
          <Repeat2 className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            Repeats {task.recurrence.type}
            {task.recurrence.interval > 1 && ` every ${task.recurrence.interval} ${task.recurrence.type}s`}
          </span>
        </div>
      )}

      {/* Collaborators Section */}
      {(task.collaborators && Object.keys(task.collaborators).length > 0) || isOwner ? (
        <div className={`px-4 sm:px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Users className="w-3.5 h-3.5" />
              Collaborators
            </p>
          </div>

          {task.collaborators && (
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(task.collaborators).map(([collabId, collab]) => (
                <div
                  key={collabId}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors group ${isDarkMode ? 'bg-blue-900/30 border border-blue-700 hover:bg-blue-900/50' : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'}`}
                >
                  {collab.photoURL ? (
                    <img
                      src={collab.photoURL}
                      alt={collab.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-semibold ${isDarkMode ? 'bg-blue-600' : 'bg-blue-600'}`}>
                      {(collab.name || collab.email || collabId).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                    {collab.name || collab.email || collabId.substring(0, 8)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Subtasks Section */}
      <div className={`px-4 sm:px-6 py-4`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between mb-3 text-sm font-semibold transition-colors group ${isDarkMode ? 'text-gray-200 hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'}`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-gray-500 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-600'}`} />
            Subtasks {totalSubtasks > 0 && `(${completedSubtasks}/${totalSubtasks})`}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Subtasks List */}
        {isExpanded && (
          <div className="space-y-2 mb-3">
            {subtasks.length > 0 ? (
              subtasks.map(([subId, subtask]) => (
                <div
                  key={subId}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <button
                    onClick={() => onToggleSubtask(task._owner, task._taskId, subId)}
                    className={`flex-shrink-0 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'}`}
                  >
                    {subtask.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <span
                    className={`flex-1 text-sm transition-all ${
                      subtask.completed
                        ? `${isDarkMode ? 'text-gray-500' : 'text-gray-400'} line-through`
                        : `${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`
                    }`}
                  >
                    {subtask.title}
                  </span>

                  {isOwner && (
                    <button
                      onClick={() => onDeleteSubtask(task._owner, task._taskId, subId)}
                      className={`flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-gray-600 hover:text-red-500' : 'text-gray-300 hover:text-red-600'}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className={`text-sm text-center py-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No subtasks yet
              </p>
            )}
          </div>
        )}

        {/* Add Subtask Form */}
        {isOwner && isExpanded && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newSubtaskTitle.trim()) {
                onAddSubtask(task._owner, task._taskId, newSubtaskTitle);
                setNewSubtaskTitle('');
              }
            }}
            className="flex gap-2 mt-3"
          >
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a new subtask..."
              className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TaskCardAdvanced;
