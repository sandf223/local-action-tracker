import { NextResponse } from 'next/server';
import { fetchTask3Rows } from '@/lib/external-api';

export async function GET() {
  try {
    const data = await fetchTask3Rows();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'External API error';
    console.error('Error fetching task3 data:', error);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
