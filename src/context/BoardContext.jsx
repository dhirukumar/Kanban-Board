'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BoardContext = createContext();

export function BoardProvider({ children, initialBoardId = null }) {
  const [board, setBoard] = useState(null);
  const [boardId, setBoardId] = useState(initialBoardId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch board data
  const fetchBoard = useCallback(async () => {
    if (!boardId) {
      // Create a default board if none exists
      try {
        const response = await fetch('/api/board', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'My Board',
            users: [
              { id: 'u1', name: 'Alice' },
              { id: 'u2', name: 'Bob' },
            ],
          }),
        });
        const newBoard = await response.json();
        setBoardId(newBoard._id);
        setBoard(newBoard);
        setLoading(false);
        return;
      } catch (err) {
        setError('Failed to create board');
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/board?id=${boardId}`);
      if (!response.ok) throw new Error('Failed to fetch board');
      const data = await response.json();
      setBoard(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  // Add task with optimistic update
  const addTask = useCallback(async (columnId, taskData) => {
    if (!board || !boardId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      title: taskData.title,
      description: taskData.description || '',
      assignedTo: taskData.assignedTo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optimistic update
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId
          ? { ...col, tasks: [...col.tasks, optimisticTask] }
          : col
      ),
    }));

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, columnId, task: taskData }),
      });

      if (!response.ok) throw new Error('Failed to add task');
      
      const { board: updatedBoard } = await response.json();
      setBoard(updatedBoard);
    } catch (err) {
      // Rollback on error
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.filter((t) => t.id !== tempId) }
            : col
        ),
      }));
      throw err;
    }
  }, [board, boardId]);

  // Update task with optimistic update
  const updateTask = useCallback(async (columnId, taskId, updates) => {
    if (!board || !boardId) return;

    // Store old state for rollback
    const oldBoard = { ...board };

    // Optimistic update
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              tasks: col.tasks.map((t) =>
                t.id === taskId ? { ...t, ...updates, updatedAt: new Date() } : t
              ),
            }
          : col
      ),
    }));

    try {
      const response = await fetch('/api/tasks/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, columnId, taskId, updates }),
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      const { board: updatedBoard } = await response.json();
      setBoard(updatedBoard);
    } catch (err) {
      // Rollback on error
      setBoard(oldBoard);
      throw err;
    }
  }, [board, boardId]);

  // Delete task with optimistic update
  const deleteTask = useCallback(async (columnId, taskId) => {
    if (!board || !boardId) return;

    // Store old state for rollback
    const oldBoard = { ...board };

    // Optimistic update
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          : col
      ),
    }));

    try {
      const response = await fetch(
        `/api/tasks/delete?boardId=${boardId}&columnId=${columnId}&taskId=${taskId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete task');
      
      const { board: updatedBoard } = await response.json();
      setBoard(updatedBoard);
    } catch (err) {
      // Rollback on error
      setBoard(oldBoard);
      throw err;
    }
  }, [board, boardId]);

  // Handle drag and drop
  const handleDragEnd = useCallback(async (result) => {
    if (!result.destination || !board || !boardId) return;

    const { source, destination, draggableId } = result;

    // No movement
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Store old state for rollback
    const oldBoard = { ...board };

    // Optimistic update
    const newColumns = Array.from(board.columns);
    const sourceColumn = newColumns.find((col) => col.id === source.droppableId);
    const destColumn = newColumns.find((col) => col.id === destination.droppableId);

    const sourceTasks = Array.from(sourceColumn.tasks);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // Same column
      sourceTasks.splice(destination.index, 0, movedTask);
      sourceColumn.tasks = sourceTasks;
    } else {
      // Different column
      sourceColumn.tasks = sourceTasks;
      const destTasks = Array.from(destColumn.tasks);
      destTasks.splice(destination.index, 0, movedTask);
      destColumn.tasks = destTasks;
    }

    setBoard({ ...board, columns: newColumns });

    try {
      const response = await fetch('/api/tasks/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          taskId: draggableId,
          sourceColumnId: source.droppableId,
          destinationColumnId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        }),
      });

      if (!response.ok) throw new Error('Failed to move task');
      
      const { board: updatedBoard } = await response.json();
      setBoard(updatedBoard);
    } catch (err) {
      // Rollback on error
      setBoard(oldBoard);
      console.error('Failed to move task:', err);
    }
  }, [board, boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const value = {
    board,
    boardId,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    handleDragEnd,
    refreshBoard: fetchBoard,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within BoardProvider');
  }
  return context;
}