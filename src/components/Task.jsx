
'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useBoardContext } from '../context/BoardContext';
import UserAvatar from './UserAvatar';

export default function Task({ task, index, columnId, users }) {
  const { updateTask, deleteTask } = useBoardContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editAssignedTo, setEditAssignedTo] = useState(task.assignedTo || '');
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!editTitle.trim()) return;

    try {
      await updateTask(columnId, task.id, {
        title: editTitle,
        description: editDescription,
        assignedTo: editAssignedTo || null,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setIsDeleting(true);
    try {
      await deleteTask(columnId, task.id);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setIsDeleting(false);
    }
  };

  const assignedUser = users.find((u) => u.id === task.assignedTo);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-3 transition-all ${
            snapshot.isDragging ? 'rotate-2 shadow-xl' : 'shadow-sm'
          } ${isDeleting ? 'opacity-50' : ''}`}
          role="listitem"
          aria-label={`Task: ${task.title}`}
        >
          <div className="bg-white rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="p-3 space-y-2" aria-label="Edit task">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                  aria-label="Task title"
                  aria-required="true"
                />
                
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                  rows="2"
                  className="w-full px-2 py-1 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none text-sm"
                  aria-label="Task description"
                />

                <select
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  aria-label="Assign task to user"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    aria-label="Save changes"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(task.title);
                      setEditDescription(task.description || '');
                      setEditAssignedTo(task.assignedTo || '');
                    }}
                    className="px-3 py-1 border border-gray-400 rounded hover:bg-gray-50 text-sm transition-colors text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3">
                {/* Drag Handle and Menu */}
                <div className="flex items-start justify-between mb-2">
                  <div
                    {...provided.dragHandleProps}
                    className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-700 mr-2 mt-1"
                    role="button"
                    aria-label="Drag to reorder task"
                    tabIndex={0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 leading-snug">{task.title}</h3>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="text-gray-500 hover:text-gray-700 p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
                      aria-label="Task options"
                      aria-expanded={showMenu}
                      aria-haspopup="true"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {showMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenu(false)}
                          aria-hidden="true"
                        />
                        <div 
                          className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-300 z-20"
                          role="menu"
                          aria-label="Task actions"
                        >
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                            role="menuitem"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDelete();
                              setShowMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                            role="menuitem"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {assignedUser ? (
                    <UserAvatar user={assignedUser} />
                  ) : (
                    <span className="text-xs text-gray-500">Unassigned</span>
                  )}

                  <time 
                    className="text-xs text-gray-500"
                    dateTime={task.createdAt}
                  >
                    {new Date(task.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}