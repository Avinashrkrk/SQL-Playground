export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/db';

// GET: Fetch all playgrounds
export async function GET() {
  try {
    const playgrounds = DatabaseManager.getPlaygrounds();
    return NextResponse.json(playgrounds);
  } catch (error) {
    console.error('GET /api/playgrounds error:', error); 
    return NextResponse.json(
      { error: 'Failed to fetch playgrounds' },
      { status: 500 }
    );
  }
}

// POST: Create a new playground
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Playground name is required' },
        { status: 400 }
      );
    }

    const playground = DatabaseManager.createPlayground(name.trim());
    return NextResponse.json(playground);
  } catch (error) {
    console.error('POST /api/playgrounds error:', error); 
    return NextResponse.json(
      { error: 'Failed to create playground' },
      { status: 500 }
    );
  }
}
