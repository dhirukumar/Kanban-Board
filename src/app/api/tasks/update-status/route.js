
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Board from '@/models/Board';

// PUT /api/tasks/update-status - Move task between columns (change status)
export async function PUT(request) {
  try {
    await connectDB();
    
    const { boardId, taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = await request.json();
    
    if (!boardId || !taskId || !sourceColumnId || !destinationColumnId || sourceIndex === undefined || destinationIndex === undefined) {
      return NextResponse.json(
        { error: 'boardId, taskId, sourceColumnId, destinationColumnId, sourceIndex, and destinationIndex are required' },
        { status: 400 }
      );
    }

    const board = await Board.findById(boardId);
    
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const sourceColumn = board.columns.find((col) => col.id === sourceColumnId);
    const destinationColumn = board.columns.find((col) => col.id === destinationColumnId);
    
    if (!sourceColumn || !destinationColumn) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    // Find and remove task from source column
    const taskIndex = sourceColumn.tasks.findIndex((t) => t.id === taskId);
    
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
    movedTask.updatedAt = new Date();

    // Add task to destination column at the specified index
    destinationColumn.tasks.splice(destinationIndex, 0, movedTask);

    await board.save();

    return NextResponse.json({ 
      message: 'Task status updated successfully', 
      board,
      task: movedTask 
    });
  } catch (error) {
    console.error('Update Task Status Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}