
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Board from '@/models/Board';

// GET /api/board - Get all boards or specific board
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('id');

    if (boardId) {
      const board = await Board.findById(boardId);
      if (!board) {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 });
      }
      return NextResponse.json(board);
    }

    const boards = await Board.find({}).sort({ createdAt: -1 });
    return NextResponse.json(boards);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/board - Create a new board
export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    // Create default board structure if not provided
    const boardData = {
      name: data.name || 'My Board',
      columns: data.columns || [
        {
          id: 'todo',
          title: 'To Do',
          tasks: [],
          order: 0,
        },
        {
          id: 'inprogress',
          title: 'In Progress',
          tasks: [],
          order: 1,
        },
        {
          id: 'done',
          title: 'Done',
          tasks: [],
          order: 2,
        },
      ],
      users: data.users || [],
    };

    const board = new Board(boardData);
    await board.save();

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/board - Update entire board (for drag & drop)
export async function PUT(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('id');
    
    if (!boardId) {
      return NextResponse.json({ error: 'Board ID is required' }, { status: 400 });
    }

    const updatedData = await request.json();
    
    const board = await Board.findByIdAndUpdate(
      boardId,
      { 
        columns: updatedData.columns,
        users: updatedData.users,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/board - Delete a board
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('id');
    
    if (!boardId) {
      return NextResponse.json({ error: 'Board ID is required' }, { status: 400 });
    }

    const board = await Board.findByIdAndDelete(boardId);

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}