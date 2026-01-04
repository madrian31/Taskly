import React, { useState, useCallback } from 'react';
import TaskCard from './TaskCard';

/**
 * Example integration of the new TaskCard component
 * This shows how to use the component with state management
 */

const TasksContainer = () => {
  const [tasks, setTasks] = useState({
    // Example task structure
    'user123_task1': {
      _owner: 'user123',
      _taskId: 'task1',
      _ownerDisplay: 'John Doe',
      title: 'Design new dashboard layout',
      description: 'Create mockups for the updated dashboard interface',
      completed: false,
      targetDate: '2026-01-15',
      nextDue: null,
      recurrence: { type: 'weekly', interval: 1 },
      collaborators: {
        'user456': {
          name: 'Jane Smith',
          email: 'jane@example.com',
          photoURL: 'https://ui-avatars.com/api/?name=Jane+Smith',
        },
        'user789': {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          photoURL: 'https://ui-avatars.com/api/?name=Bob+Johnson',
        },
      },
      subtasks: {
        'sub1': { title: 'Create wireframes', completed: true },
        'sub2': { title: 'Design color palette', completed: false },
        'sub3': { title: 'Create component library', completed: false },
      },
      createdAt: Date.now(),
    },
    'user123_task2': {
      _owner: 'user123',
      _taskId: 'task2',
      _ownerDisplay: 'John Doe',
      title: 'Update API documentation',
      description: 'Document new endpoints and update existing ones',
      completed: true,
      targetDate: '2026-01-10',
      nextDue: null,
      recurrence: { type: 'none', interval: 1 },
      collaborators: {},
      subtasks: {
        'sub1': { title: 'Document POST endpoints', completed: true },
        'sub2': { title: 'Add code examples', completed: true },
      },
      createdAt: Date.now() - 86400000,
    },
  });

  // Handler: Update task
  const handleUpdateTask = useCallback((ownerUid, taskId, updates) => {
    const key = `${ownerUid}_${taskId}`;
    setTasks((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
  }, []);

  // Handler: Toggle task completion
  const handleToggleComplete = useCallback((ownerUid, taskId) => {
    const key = `${ownerUid}_${taskId}`;
    setTasks((prev) => ({
      ...prev,
      [key]: { ...prev[key], completed: !prev[key].completed },
    }));
  }, []);

  // Handler: Delete task
  const handleDeleteTask = useCallback((ownerUid, taskId) => {
    const key = `${ownerUid}_${taskId}`;
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  }, []);

  // Handler: Add subtask
  const handleAddSubtask = useCallback((ownerUid, taskId, title) => {
    const key = `${ownerUid}_${taskId}`;
    setTasks((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        subtasks: {
          ...prev[key].subtasks,
          [Date.now()]: { title, completed: false },
        },
      },
    }));
  }, []);

  // Handler: Toggle subtask completion
  const handleToggleSubtask = useCallback((ownerUid, taskId, subId) => {
    const key = `${ownerUid}_${taskId}`;
    setTasks((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        subtasks: {
          ...prev[key].subtasks,
          [subId]: {
            ...prev[key].subtasks[subId],
            completed: !prev[key].subtasks[subId].completed,
          },
        },
      },
    }));
  }, []);

  // Handler: Delete subtask
  const handleDeleteSubtask = useCallback((ownerUid, taskId, subId) => {
    const key = `${ownerUid}_${taskId}`;
    setTasks((prev) => {
      const updated = { ...prev };
      const subtasks = { ...updated[key].subtasks };
      delete subtasks[subId];
      return {
        ...prev,
        [key]: { ...prev[key], subtasks },
      };
    });
  }, []);

  // Handler: Add collaborator
  const handleAddCollaborator = useCallback((ownerUid, taskId, email) => {
    const key = `${ownerUid}_${taskId}`;
    setTasks((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        collaborators: {
          ...prev[key].collaborators,
          [email]: {
            name: email.split('@')[0],
            email,
            photoURL: `https://ui-avatars.com/api/?name=${email}`,
          },
        },
      },
    }));
  }, []);

  // Handler: Remove collaborator
  const handleRemoveCollaborator = useCallback((ownerUid, taskId, collabId) => {
    const key = `${ownerUid}_${taskId}`;
    setTasks((prev) => {
      const updated = { ...prev };
      const collaborators = { ...updated[key].collaborators };
      delete collaborators[collabId];
      return {
        ...prev,
        [key]: { ...prev[key], collaborators },
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-2 text-gray-600">Manage your tasks with a modern, clean interface</p>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(tasks).map(([key, task]) => (
            <TaskCard
              key={key}
              task={task}
              isOwner={true} // In real app, check against current user
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
              onAddSubtask={handleAddSubtask}
              onToggleSubtask={handleToggleSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              onAddCollaborator={handleAddCollaborator}
              onRemoveCollaborator={handleRemoveCollaborator}
            />
          ))}
        </div>

        {/* Empty state */}
        {Object.keys(tasks).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksContainer;
