
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useBoard(boardId) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoard = useCallback(async () => {
    if (!boardId) return;

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

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  return { board, loading, error, refetch: fetchBoard };
}

export function useOptimisticUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);

  const withOptimistic = useCallback(async (optimisticFn, apiFn, rollbackFn) => {
    setIsUpdating(true);
    
    // Apply optimistic update
    optimisticFn();

    try {
      // Call API
      await apiFn();
    } catch (error) {
      // Rollback on error
      if (rollbackFn) rollbackFn();
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { withOptimistic, isUpdating };
}