
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Board from '@/models/Board';

// PUT /api/tasks/update - Update a task
export async function PUT(request) {
  try {
    await connectDB();
    
    const { boardId, columnId, taskId, updates } = await request.json();
    
    if (!boardId || !columnId || !taskId) {
      return NextResponse.json(
        { error: 'boardId, columnId, and taskId are required' },
        { status: 400 }
      );
    }

    const board = await Board.findById(boardId);
    
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const column = board.columns.find((col) => col.id === columnId);
    
    if (!column) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    const task = column.tasks.find((t) => t.id === taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task fields
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.assignedTo !== undefined) task.assignedTo = updates.assignedTo;
    task.updatedAt = new Date();

    await board.save();

    return NextResponse.json({ board, task });
  } catch (error) {
    console.error('Update Task Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}