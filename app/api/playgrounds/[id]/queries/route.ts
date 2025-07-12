import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/db';

export const runtime = 'nodejs'; 

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const playground = await DatabaseManager.getPlayground(id); 
    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }
    
    const queries = await DatabaseManager.getQueries(id); 
    return NextResponse.json(queries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch queries' }, { status: 500 });
  }
}
