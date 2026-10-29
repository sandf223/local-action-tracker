import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET /api/actions — получить последние 30 действий
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, action_type, entity_id, payload, created_at FROM user_actions ORDER BY created_at DESC LIMIT 30;'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching actions:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Database fetch error' },
      { status: 500 }
    );
  }
}

// POST /api/actions — записать новое действие
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action_type, entity_id, payload } = body;

    if (!action_type) {
      return NextResponse.json(
        { success: false, error: 'action_type is required' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO user_actions (action_type, entity_id, payload)
      VALUES ($1, $2, $3)
      RETURNING id, action_type, entity_id, payload, created_at;
    `;
    const values = [
      action_type,
      entity_id || null,
      JSON.stringify(payload || {})
    ];

    const result = await pool.query(query, values);
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error inserting action:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Database insert error' },
      { status: 500 }
    );
  }
}