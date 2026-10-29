import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  console.log('--- Checking DB connection ---');
  console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);

  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW() as current_time, current_database() as db_name;');
      return NextResponse.json({
        status: 'ok',
        currentTime: res.rows[0].current_time,
        database: res.rows[0].db_name,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Database connection detailed error:', err);
    return NextResponse.json(
      {
        status: 'error',
        message: err?.message || 'Unknown error',
        code: err?.code || null,
        detail: err?.detail || null,
      },
      { status: 500 }
    );
  }
}