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
} from 'lucide-react';

/**
 * Modern, clean Task Card component with Tailwind CSS
 * Features:
 * - Improved visual hierarchy
 * - Interactive progress bar based on subtask completion
 * - Streamlined collaborators management
 * - Better subtasks UI with smooth interactions
 * - Destructive actions moved to menu
 * - Mobile-friendly layout
 * - Smooth transitions and hover effects
 */

const TaskCard = ({
  task,
  isOwner = false,
  onUpdateTask = () => {},
  onDeleteTask = () => {},
  onToggleComplete = () => {},
  onAddSubtask = () => {},
  onToggleSubtask = () => {},
  onDeleteSubtask = () => {},
  onAddCollaborator = () => {},
  onRemoveCollaborator = () => {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCollaboratorInput, setShowCollaboratorInput] = useState(false);
  const menuRef = useRef(null);

  // Calculate progress metrics
  const subtasks = task.subtasks ? Object.entries(task.subtasks) : [];
  const completedSubtasks = subtasks.filter(([_, s]) => s.completed).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

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

  // Handle adding subtask
  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task._owner, task._taskId, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  // Handle menu close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close menu only if clicking outside the menu ref
      // Don't check the button since it has its own onClick handler
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div
      className={`
        bg-white rounded-lg border transition-all duration-300 relative
        ${task.completed ? 'border-gray-200 bg-gray-50' : 'border-gray-200 hover:border-blue-300'}
        ${task.completed ? 'shadow-sm' : 'shadow-sm hover:shadow-md'}
      `}
    >
      {/* Header Section */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Checkbox and title */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => onToggleComplete(task._owner, task._taskId)}
              className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
              aria-label="Toggle task completion"
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h3
                className={`
                  text-lg font-semibold transition-all
                  ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}
                `}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Right side: Menu button */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Task menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu - Only visible when showMenu is true */}
            <div 
              style={{ display: showMenu ? 'block' : 'none' }}
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50"
            >
              <button
                onClick={() => {
                  onDeleteTask(task._owner, task._taskId);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Owner */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</p>
            <p className="mt-1 text-sm text-gray-900 font-medium">
              {isOwner ? 'You' : task._ownerDisplay || 'Unknown'}
            </p>
          </div>

          {/* Due Date */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Due Date
            </p>
            {dueDate ? (
              <p
                className={`mt-1 text-sm font-medium ${
                  dueDate.status === 'overdue'
                    ? 'text-red-600'
                    : dueDate.status === 'today'
                    ? 'text-orange-600'
                    : 'text-gray-900'
                }`}
              >
                {dueDate.text}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-400">No due date</p>
            )}
          </div>

          {/* Progress */}
          {totalSubtasks > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <ProgressIcon className="w-3.5 h-3.5" />
                Progress
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {completedSubtasks}/{totalSubtasks} ({Math.round(progressPercentage)}%)
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalSubtasks > 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recurrence Badge */}
      {task.recurrence?.type && task.recurrence.type !== 'none' && (
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex items-center gap-2">
          <Repeat2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            Repeats {task.recurrence.type}
            {task.recurrence.interval > 1 && ` every ${task.recurrence.interval} ${task.recurrence.type}s`}
          </span>
        </div>
      )}

      {/* Collaborators Section */}
      {(task.collaborators && Object.keys(task.collaborators).length > 0) || isOwner ? (
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Collaborators
            </p>
            {isOwner && (
              <button
                onClick={() => setShowCollaboratorInput(!showCollaboratorInput)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showCollaboratorInput ? 'Cancel' : 'Add'}
              </button>
            )}
          </div>

          {/* Add Collaborator Input */}
          {showCollaboratorInput && isOwner && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Call parent handler with email input
                // This would be expanded in real implementation
                setShowCollaboratorInput(false);
              }}
              className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          {/* Collaborator Avatars */}
          <div className="flex items-center gap-2 flex-wrap">
            {task.collaborators &&
              Object.entries(task.collaborators).map(([collabId, collab]) => (
                <div
                  key={collabId}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors group"
                >
                  {collab.photoURL ? (
                    <img
                      src={collab.photoURL}
                      alt={collab.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                      {(collab.name || collab.email || collabId).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {collab.name || collab.email || collabId.substring(0, 8)}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => onRemoveCollaborator(task._owner, task._taskId, collabId)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove collaborator"
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      ) : null}

      {/* Subtasks Section */}
      <div className="px-4 sm:px-6 py-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-3 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors group"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
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
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group transition-colors"
                >
                  <button
                    onClick={() => onToggleSubtask(task._owner, task._taskId, subId)}
                    className="flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
                    aria-label="Toggle subtask completion"
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
                        ? 'text-gray-400 line-through'
                        : 'text-gray-700'
                    }`}
                  >
                    {subtask.title}
                  </span>

                  {isOwner && (
                    <button
                      onClick={() => onDeleteSubtask(task._owner, task._taskId, subId)}
                      className="flex-shrink-0 p-1 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Delete subtask"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-3">No subtasks yet</p>
            )}
          </div>
        )}

        {/* Add Subtask Form */}
        {isOwner && isExpanded && (
          <form onSubmit={handleAddSubtask} className="flex gap-2 mt-3">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a new subtask..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              aria-label="Add subtask"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </form>
        )}

        {/* Expand Subtasks Button */}
        {!isExpanded && totalSubtasks > 0 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Show subtasks
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
