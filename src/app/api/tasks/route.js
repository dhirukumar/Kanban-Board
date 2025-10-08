
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Board from '@/models/Board';

// POST /api/tasks/add - Add a new task
export async function POST(request) {
  try {
    await connectDB();
    
    const { boardId, columnId, task } = await request.json();
    
    if (!boardId || !columnId || !task) {
      return NextResponse.json(
        { error: 'boardId, columnId, and task are required' },
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

    const newTask = {
      id: `task-${Date.now()}`,
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    column.tasks.push(newTask);
    await board.save();

    return NextResponse.json({ board, task: newTask }, { status: 201 });
  } catch (error) {
    console.error('Add Task Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}