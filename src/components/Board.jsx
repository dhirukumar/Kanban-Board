
'use client';

import { DragDropContext } from '@hello-pangea/dnd';
import { Droppable } from '@hello-pangea/dnd';
import Column from './Column';
import { useBoardContext } from '../context/BoardContext';

export default function Board() {
  const { board, loading, error, handleDragEnd } = useBoardContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" aria-hidden="true"></div>
          <p className="mt-4 text-gray-700">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="alert" aria-live="assertive">
        <div className="bg-red-50 border border-red-300 rounded-lg p-6 max-w-md">
          <h2 className="text-red-900 font-semibold mb-2">Error Loading Board</h2>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status">
        <p className="text-gray-700">No board found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{board.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2" role="list" aria-label="Team members">
              <span className="text-sm text-gray-700 font-medium">Team:</span> 
              {board.users.map((user) => (
                <div
                  key={user.id}
                  role="listitem"
                  className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm"
                >
                  <div 
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold"
                    aria-hidden="true"
                  >
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-800">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div 
            className="flex gap-6 overflow-x-auto pb-4" 
            role="region" 
            aria-label="Kanban board columns"
            tabIndex={0}
          >
            {board.columns.map((column) => (
              <Column key={column.id} column={column} users={board.users} />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}