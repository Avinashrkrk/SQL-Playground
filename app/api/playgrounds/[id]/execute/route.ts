import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;

  try {
    const { query } = await req.json();

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
    return NextResponse.json({
      error: (error as Error).message || 'Failed to execute query'
    }, { status: 400 });
  }
}
