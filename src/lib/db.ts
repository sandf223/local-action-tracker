import { Pool } from 'pg';

// Используем singleton-паттерн, чтобы в dev-режиме Next.js не плодил лишние подключения
const globalForPg = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForPg.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;