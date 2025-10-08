// app/api/tasks/status/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Board from '@/models/Board';

// GET /api/tasks/status - Get task by ID
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');
    const taskId = searchParams.get('taskId');
    
    if (!boardId || !taskId) {
      return NextResponse.json(
        { error: 'boardId and taskId are required' },
        { status: 400 }
      );
    }

    const board = await Board.findById(boardId);
    
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    let foundTask = null;
    let foundColumnId = null;

    for (const column of board.columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        foundTask = task;
        foundColumnId = column.id;
        break;
      }
    }

    if (!foundTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task: foundTask, columnId: foundColumnId });
  } catch (error) {
    console.error('Get Task Status Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}