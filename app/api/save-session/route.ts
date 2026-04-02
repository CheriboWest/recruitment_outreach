import { NextRequest, NextResponse } from 'next/server';
import { saveSession } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await saveSession(body);
    if (!result) {
      return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
    }
    return NextResponse.json({ id: result.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
