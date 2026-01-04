import React, { useState, useCallback, useMemo } from 'react';
import TaskCard from './TaskCard';

/**
 * Practical Code Examples & Recipes
 * Real-world patterns for using the new TaskCard component
 */

// ============================================================================
// RECIPE 1: Firebase Integration Pattern
// ============================================================================

export const FirebaseTasksIntegration = () => {
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen to Firebase changes
  React.useEffect(() => {
    setLoading(true);
    // Replace with your actual Firebase listener
    const unsubscribe = listenToTasks((newTasks) => {
      setTasks(newTasks);
      setLoading(false);
    });

    return () => unsubscribe?.();
  }, []);

  const handleToggleComplete = useCallback(async (ownerUid, taskId) => {
    try {
      const task = tasks[`${ownerUid}_${taskId}`];
      // Replace with your Firebase update logic
      await updateTaskInFirebase(ownerUid, taskId, {
        completed: !task.completed
      });
      
      setTasks(prev => ({
        ...prev,
        [`${ownerUid}_${taskId}`]: {
          ...prev[`${ownerUid}_${taskId}`],
          completed: !task.completed
        }
      }));
    } catch (err) {
      setError(err.message);
      console.error('Failed to toggle task:', err);
    }
  }, [tasks]);

  // Similar patterns for other handlers...

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading tasks...</div>;
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(tasks).map(([key, task]) => (
        <TaskCard
          key={key}
          task={task}
          onToggleComplete={handleToggleComplete}
          // ... other handlers
        />
      ))}
    </div>
  );
};

// ============================================================================
// RECIPE 2: Task Filtering & Sorting
// ============================================================================

export const FilteredTasksView = ({ tasks, currentUserId }) => {
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('date'); // date, priority, status

  const filteredAndSortedTasks = useMemo(() => {
    let result = Object.entries(tasks);

    // Apply status filter
    if (filterStatus === 'active') {
      result = result.filter(([_, task]) => !task.completed);
    } else if (filterStatus === 'completed') {
      result = result.filter(([_, task]) => task.completed);
    }

    // Apply sorting
    result.sort(([_, a], [__, b]) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.targetDate || 0) - new Date(a.targetDate || 0);
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        case 'status':
          return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, filterStatus, sortBy]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedTasks.length > 0 ? (
          filteredAndSortedTasks.map(([key, task]) => (
            <TaskCard
              key={key}
              task={task}
              isOwner={task._owner === currentUserId}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// RECIPE 3: Search & Highlight Pattern
// ============================================================================

export const SearchableTasks = ({ tasks, currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const results = useMemo(() => {
    if (!searchQuery.trim()) return Object.entries(tasks);

    const query = searchQuery.toLowerCase();
    return Object.entries(tasks).filter(([_, task]) =>
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-medium">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-gray-600">
          Found {results.length} task{results.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(([key, task]) => (
          <div key={key} className="relative">
            {searchQuery && (
              <div className="absolute -top-8 right-0 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Match found
              </div>
            )}
            <TaskCard task={task} isOwner={task._owner === currentUserId} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// RECIPE 4: Collaborative Tasks Dashboard
// ============================================================================

export const CollaborativeDashboard = ({ tasks, currentUserId }) => {
  const myTasks = useMemo(() => {
    return Object.entries(tasks)
      .filter(([_, task]) => task._owner === currentUserId)
      .reduce((acc, [key, task]) => ({ ...acc, [key]: task }), {});
  }, [tasks, currentUserId]);

  const sharedTasks = useMemo(() => {
    return Object.entries(tasks)
      .filter(([_, task]) =>
        task._owner !== currentUserId &&
        task.collaborators &&
        currentUserId in task.collaborators
      )
      .reduce((acc, [key, task]) => ({ ...acc, [key]: task }), {});
  }, [tasks, currentUserId]);

  const assignedToMe = useMemo(() => {
    return Object.entries(tasks)
      .filter(([_, task]) => {
        const subtasks = task.subtasks ? Object.entries(task.subtasks) : [];
        return subtasks.some(([_, sub]) => sub.assignee === currentUserId);
      })
      .reduce((acc, [key, task]) => ({ ...acc, [key]: task }), {});
  }, [tasks, currentUserId]);

  return (
    <div className="space-y-8">
      {/* My Tasks */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            My Tasks ({Object.keys(myTasks).length})
          </h2>
          <p className="text-gray-600">Tasks you own</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(myTasks).map(([key, task]) => (
            <TaskCard key={key} task={task} isOwner={true} />
          ))}
          {Object.keys(myTasks).length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No tasks yet
            </div>
          )}
        </div>
      </section>

      {/* Shared Tasks */}
      {Object.keys(sharedTasks).length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Shared with Me ({Object.keys(sharedTasks).length})
            </h2>
            <p className="text-gray-600">Tasks others are collaborating on</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(sharedTasks).map(([key, task]) => (
              <TaskCard key={key} task={task} isOwner={false} />
            ))}
          </div>
        </section>
      )}

      {/* Assigned Subtasks */}
      {Object.keys(assignedToMe).length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Assigned to Me ({Object.keys(assignedToMe).length})
            </h2>
            <p className="text-gray-600">Subtasks you're responsible for</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(assignedToMe).map(([key, task]) => (
              <TaskCard key={key} task={task} isOwner={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// ============================================================================
// RECIPE 5: Keyboard Shortcuts Integration
// ============================================================================

export const KeyboardShortcutsDemo = () => {
  const [shortcutMap] = useState({
    'Ctrl+E': 'Edit selected task',
    'Ctrl+Space': 'Toggle task completion',
    'Ctrl+N': 'New task',
    'Escape': 'Close menu',
    '/': 'Focus search',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Keyboard Shortcuts
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(shortcutMap).map(([shortcut, description]) => (
          <div key={shortcut} className="flex items-center justify-between">
            <p className="text-gray-700">{description}</p>
            <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
              {shortcut}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// RECIPE 6: Bulk Actions Pattern
// ============================================================================

export const TasksWithBulkActions = ({ tasks, currentUserId }) => {
  const [selectedTasks, setSelectedTasks] = useState(new Set());

  const toggleTaskSelection = (key) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedTasks(newSelected);
  };

  const selectAll = () => {
    if (selectedTasks.size === Object.keys(tasks).length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(Object.keys(tasks)));
    }
  };

  const bulkDelete = () => {
    if (window.confirm(`Delete ${selectedTasks.size} task(s)?`)) {
      selectedTasks.forEach(key => {
        // Call delete handler
      });
      setSelectedTasks(new Set());
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedTasks.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-blue-900 font-medium">
            {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={bulkDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedTasks(new Set())}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          checked={selectedTasks.size === Object.keys(tasks).length && Object.keys(tasks).length > 0}
          onChange={selectAll}
          className="w-4 h-4 accent-blue-600 cursor-pointer"
        />
        <label className="text-sm font-medium text-gray-700 cursor-pointer">
          Select all ({Object.keys(tasks).length})
        </label>
      </div>

      {/* Task Grid with Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(tasks).map(([key, task]) => (
          <div
            key={key}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTasks.has(key)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => toggleTaskSelection(key)}
          >
            <input
              type="checkbox"
              checked={selectedTasks.has(key)}
              onChange={() => toggleTaskSelection(key)}
              className="w-4 h-4 accent-blue-600 cursor-pointer mt-0.5"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// RECIPE 7: Analytics & Stats
// ============================================================================

export const TaskAnalytics = ({ tasks }) => {
  const stats = useMemo(() => {
    const values = Object.values(tasks);
    const totalTasks = values.length;
    const completedTasks = values.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;

    const overdueTasks = values.filter(t => {
      if (!t.targetDate && !t.nextDue) return false;
      const dueDate = new Date(t.targetDate || t.nextDue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today && !t.completed;
    }).length;

    const totalSubtasks = values.reduce((sum, t) => {
      return sum + (t.subtasks ? Object.keys(t.subtasks).length : 0);
    }, 0);

    const completedSubtasks = values.reduce((sum, t) => {
      if (!t.subtasks) return sum;
      return sum + Object.values(t.subtasks).filter(s => s.completed).length;
    }, 0);

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalSubtasks,
      completedSubtasks,
      subtaskCompletionRate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0,
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Tasks */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTasks}</p>
        <p className="text-xs text-gray-500 mt-2">{stats.activeTasks} active</p>
      </div>

      {/* Completion Rate */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
        <p className="text-3xl font-bold text-green-600 mt-2">{stats.completionRate}%</p>
        <p className="text-xs text-gray-500 mt-2">{stats.completedTasks}/{stats.totalTasks}</p>
      </div>

      {/* Overdue */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-sm font-medium">Overdue</p>
        <p className={`text-3xl font-bold mt-2 ${stats.overdueTasks > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {stats.overdueTasks}
        </p>
        <p className="text-xs text-gray-500 mt-2">Tasks past due</p>
      </div>

      {/* Subtask Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-sm font-medium">Subtasks</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">{stats.subtaskCompletionRate}%</p>
        <p className="text-xs text-gray-500 mt-2">{stats.completedSubtasks}/{stats.totalSubtasks}</p>
      </div>
    </div>
  );
};

// ============================================================================
// RECIPE 8: Print Friendly View
// ============================================================================

export const PrintableTasks = ({ tasks }) => {
  return (
    <div className="print:p-0">
      {/* Print button */}
      <button
        onClick={() => window.print()}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 print:hidden"
      >
        Print Tasks
      </button>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            font-size: 12pt;
          }
          .task-card {
            page-break-inside: avoid;
            border: 1px solid #ddd;
            margin-bottom: 12pt;
            padding: 12pt;
          }
          .task-title {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 6pt;
          }
          .task-metadata {
            font-size: 10pt;
            color: #666;
            margin-bottom: 6pt;
          }
          .task-description {
            font-size: 11pt;
            margin-bottom: 6pt;
          }
        }
      `}</style>

      {/* Task list */}
      <div className="space-y-4 print:space-y-0">
        {Object.entries(tasks).map(([key, task]) => (
          <div key={key} className="task-card">
            <div className="task-title">{task.title}</div>
            {task.description && <div className="task-description">{task.description}</div>}
            <div className="task-metadata">
              <p>Owner: {task._ownerDisplay}</p>
              {task.targetDate && <p>Due: {new Date(task.targetDate).toLocaleDateString()}</p>}
              {task.completed && <p>Status: ✓ Completed</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  FirebaseTasksIntegration,
  FilteredTasksView,
  SearchableTasks,
  CollaborativeDashboard,
  KeyboardShortcutsDemo,
  TasksWithBulkActions,
  TaskAnalytics,
  PrintableTasks,
};
