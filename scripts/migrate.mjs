import pg from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

console.log('🚀 Running Migration for Tokyo Trip 2027...');

// 1. Local SQLite Migration
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const sqlite = new Database(path.join(dataDir, 'trips.sqlite'));
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS trip_plans (
    id TEXT PRIMARY KEY,
    trip_title TEXT NOT NULL,
    creator_name TEXT NOT NULL,
    target_year INTEGER NOT NULL DEFAULT 2027,
    target_month INTEGER NOT NULL DEFAULT 11,
    duration_days INTEGER NOT NULL DEFAULT 7,
    destinations TEXT NOT NULL DEFAULT '[]',
    selected_flight TEXT,
    estimated_budget_thb REAL DEFAULT 38000,
    custom_notes TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    likes_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);
console.log('✅ SQLite Schema: OK (data/trips.sqlite)');

// 2. PostgreSQL / Supabase Migration
let pgConn = process.env.DIRECT_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || '';
if (pgConn) {
  pgConn = pgConn.replace(/[?&]sslmode=[^&]+/, '');
  const pool = new pg.Pool({
    connectionString: pgConn,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log('🔗 Connected to Remote PostgreSQL...');

    await client.query(`
      CREATE SCHEMA IF NOT EXISTS tokyo_trip;

      CREATE TABLE IF NOT EXISTS tokyo_trip.trip_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trip_title TEXT NOT NULL DEFAULT 'Tokyo Expedition 2027',
        creator_name TEXT NOT NULL DEFAULT 'Traveler',
        target_year INT NOT NULL DEFAULT 2027,
        target_month INT NOT NULL DEFAULT 11,
        duration_days INT NOT NULL DEFAULT 7,
        destinations TEXT[] DEFAULT '{}',
        selected_flight TEXT,
        estimated_budget_thb NUMERIC DEFAULT 38000,
        currency TEXT NOT NULL DEFAULT 'THB',
        custom_notes TEXT,
        tags TEXT[] DEFAULT '{}',
        likes_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.trip_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trip_title TEXT NOT NULL DEFAULT 'Tokyo Expedition 2027',
        creator_name TEXT NOT NULL DEFAULT 'Traveler',
        target_year INT NOT NULL DEFAULT 2027,
        target_month INT NOT NULL DEFAULT 11,
        duration_days INT NOT NULL DEFAULT 7,
        destinations TEXT[] DEFAULT '{}',
        selected_flight TEXT,
        estimated_budget_thb NUMERIC DEFAULT 38000,
        currency TEXT NOT NULL DEFAULT 'THB',
        custom_notes TEXT,
        tags TEXT[] DEFAULT '{}',
        likes_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Remote PostgreSQL Schema (tokyo_trip & public): OK');
    client.release();
    pool.end();
  } catch (err) {
    console.log('⚠️ Remote Postgres notice (Local SQLite active):', err.message);
    pool.end();
  }
}

console.log('🎉 Migration Completed Successfully!');
