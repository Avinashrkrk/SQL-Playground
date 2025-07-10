import { NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(
  request: Request, 
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const { query } = await request.json();

    if (!query || query.trim() === '') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const playground = await DatabaseManager.getPlayground(id);
    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }

    const result = await DatabaseManager.executeQuery(id, query.trim());
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/playgrounds/[id]/execute error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to execute query' },
      { status: 400 }
    );
  }
}
