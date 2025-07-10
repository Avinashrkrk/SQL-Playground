import { NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const playground = DatabaseManager.getPlayground(params.id);
    
    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }

    return NextResponse.json(playground);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch playground' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Playground name is required' }, { status: 400 });
    }

    const playground = DatabaseManager.getPlayground(params.id);
    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }

    DatabaseManager.updatePlayground(params.id, name.trim());
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update playground' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const playground = DatabaseManager.getPlayground(params.id);
    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }

    DatabaseManager.deletePlayground(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete playground' }, { status: 500 });
  }
}