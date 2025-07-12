import { NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playground = DatabaseManager.getPlayground(id);
    
    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }
    return NextResponse.json(playground);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch playground' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Playground name is required' }, { status: 400 });
    }
    const playground = DatabaseManager.getPlayground(id);
    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }
    DatabaseManager.updatePlayground(id, name.trim());
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update playground' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playground = DatabaseManager.getPlayground(id);
    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }
    DatabaseManager.deletePlayground(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete playground' }, { status: 500 });
  }
}
