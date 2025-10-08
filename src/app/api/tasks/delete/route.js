
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Board from '@/models/Board';

// DELETE /api/tasks/delete - Delete a task
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');
    const columnId = searchParams.get('columnId');
    const taskId = searchParams.get('taskId');
    
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

    const taskIndex = column.tasks.findIndex((t) => t.id === taskId);
    
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    column.tasks.splice(taskIndex, 1);
    await board.save();

    return NextResponse.json({ message: 'Task deleted successfully', board });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}