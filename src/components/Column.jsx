
'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';
import { useBoardContext } from '../context/BoardContext';

export default function Column({ column, users }) {
  const { addTask } = useBoardContext();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [error, setError] = useState('');

  const handleAddTask = async (e) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      await addTask(column.id, {
        title: newTaskTitle,
        description: newTaskDescription,
        assignedTo: selectedUser || null,
      });
      
      // Reset form
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedUser('');
      setIsAdding(false);
      setError('');
    } catch (err) {
      setError('Failed to add task. Please try again.');
    }
  };

  const getColumnColor = (columnId) => {
    const colors = {
      todo: 'bg-gray-100 border-gray-400',
      inprogress: 'bg-blue-50 border-blue-400',
      done: 'bg-green-50 border-green-400',
    };
    return colors[columnId] || 'bg-gray-100 border-gray-400';
  };

  const getColumnHeaderColor = (columnId) => {
    const colors = {
      todo: 'bg-gray-300 text-gray-900',
      inprogress: 'bg-blue-300 text-blue-950',
      done: 'bg-green-300 text-green-950',
    };
    return colors[columnId] || 'bg-gray-300 text-gray-900';
  };

  return (
    <div 
      className={`flex-shrink-0 w-80 rounded-lg border-2 ${getColumnColor(column.id)} shadow-md`}
      role="region"
      aria-label={`${column.title} column`}
    >
   
      <div className={`px-4 py-3 rounded-t-lg ${getColumnHeaderColor(column.id)}`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg" id={`column-${column.id}-title`}>
            {column.title}
          </h2>
          <span 
            className="bg-white bg-opacity-70 px-2 py-1 rounded-full text-sm font-medium text-gray-900"
            aria-label={`${column.tasks.length} tasks`}
          >
            {column.tasks.length}
          </span>
        </div>
      </div>

    
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-100 bg-opacity-50' : ''
            }`}
            role="list"
            aria-labelledby={`column-${column.id}-title`}
          >
            {column.tasks.length === 0 && !isAdding && (
              <p className="text-gray-500 text-center py-8 text-sm" role="status">
                No tasks yet. Add one below!
              </p>
            )}
            
            {column.tasks.map((task, index) => (
              <Task
                key={task.id}
                task={task}
                index={index}
                columnId={column.id}
                users={users}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

   
      <div className="p-3 border-t-2 border-gray-300">
        {isAdding ? (
          <form onSubmit={handleAddTask} className="space-y-2" aria-label="Add new task">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
              aria-label="Task title"
              aria-required="true"
              aria-invalid={error && !newTaskTitle.trim() ? 'true' : 'false'}
            />
            
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Description (optional)"
              rows="2"
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              aria-label="Task description"
            />

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Assign task to user"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            {error && (
              <p className="text-red-700 text-sm" role="alert" aria-live="assertive">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                aria-label="Add task"
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                  setSelectedUser('');
                  setError('');
                }}
                className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-50 transition-colors text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Cancel adding task"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            aria-label={`Add task to ${column.title}`}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        )}
      </div>
    </div>
  );
}