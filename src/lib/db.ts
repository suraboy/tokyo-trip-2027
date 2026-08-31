import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { CommunityTripPlan } from '@/types/travel';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'trips.sqlite');
const sqlite = new Database(dbPath);

// Initialize table if not exists
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
    selected_hotel_id TEXT,
    hotel_area TEXT,
    estimated_budget_thb REAL DEFAULT 38000,
    custom_notes TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    likes_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

// Auto-migrate: add columns that may be missing on older DBs
const existingCols = new Set(
  (sqlite.pragma('table_info(trip_plans)') as Array<{ name: string }>).map((c) => c.name)
);
if (!existingCols.has('selected_hotel_id')) {
  sqlite.exec('ALTER TABLE trip_plans ADD COLUMN selected_hotel_id TEXT');
}
if (!existingCols.has('hotel_area')) {
  sqlite.exec('ALTER TABLE trip_plans ADD COLUMN hotel_area TEXT');
}

export interface DbTripRow {
  id: string;
  trip_title: string;
  creator_name: string;
  target_year: number;
  target_month: number;
  duration_days: number;
  destinations: string;
  selected_flight: string | null;
  selected_hotel_id?: string | null;
  hotel_area?: string | null;
  estimated_budget_thb: number;
  custom_notes: string | null;
  tags: string;
  likes_count: number;
  created_at: string;
}

export function getAllTripPlans(): CommunityTripPlan[] {
  const stmt = sqlite.prepare('SELECT * FROM trip_plans ORDER BY datetime(created_at) DESC');
  const rows = stmt.all() as DbTripRow[];

  return rows.map((r) => ({
    id: r.id,
    trip_title: r.trip_title,
    creator_name: r.creator_name,
    target_year: r.target_year,
    target_month: r.target_month,
    duration_days: r.duration_days,
    destinations: JSON.parse(r.destinations || '[]'),
    selected_flight: r.selected_flight || undefined,
    selected_hotel_id: r.selected_hotel_id || undefined,
    hotel_area: r.hotel_area || undefined,
    estimated_budget_thb: r.estimated_budget_thb,
    custom_notes: r.custom_notes || undefined,
    tags: JSON.parse(r.tags || '[]'),
    likes_count: r.likes_count,
    created_at: r.created_at,
  }));
}

export function upsertTripPlan(plan: Partial<CommunityTripPlan>): CommunityTripPlan {
  if (plan.id) {
    const existing = sqlite.prepare('SELECT * FROM trip_plans WHERE id = ?').get(plan.id) as DbTripRow | undefined;
    if (existing) {
      // UPDATE existing plan in place
      const stmt = sqlite.prepare(`
        UPDATE trip_plans SET
          trip_title = ?,
          creator_name = ?,
          target_year = ?,
          target_month = ?,
          duration_days = ?,
          destinations = ?,
          selected_flight = ?,
          selected_hotel_id = ?,
          hotel_area = ?,
          estimated_budget_thb = ?,
          custom_notes = ?,
          tags = ?
        WHERE id = ?
      `);

      stmt.run(
        plan.trip_title ?? existing.trip_title,
        plan.creator_name ?? existing.creator_name,
        plan.target_year ?? existing.target_year,
        plan.target_month ?? existing.target_month,
        plan.duration_days ?? existing.duration_days,
        JSON.stringify(plan.destinations ?? JSON.parse(existing.destinations || '[]')),
        plan.selected_flight ?? existing.selected_flight,
        plan.selected_hotel_id ?? existing.selected_hotel_id,
        plan.hotel_area ?? existing.hotel_area,
        plan.estimated_budget_thb ?? existing.estimated_budget_thb,
        plan.custom_notes ?? existing.custom_notes,
        JSON.stringify(plan.tags ?? JSON.parse(existing.tags || '[]')),
        plan.id
      );

      return {
        id: plan.id,
        trip_title: plan.trip_title ?? existing.trip_title,
        creator_name: plan.creator_name ?? existing.creator_name,
        target_year: plan.target_year ?? existing.target_year,
        target_month: plan.target_month ?? existing.target_month,
        duration_days: plan.duration_days ?? existing.duration_days,
        destinations: plan.destinations ?? JSON.parse(existing.destinations || '[]'),
        selected_flight: plan.selected_flight ?? existing.selected_flight ?? undefined,
        selected_hotel_id: plan.selected_hotel_id ?? existing.selected_hotel_id ?? undefined,
        hotel_area: plan.hotel_area ?? existing.hotel_area ?? undefined,
        estimated_budget_thb: plan.estimated_budget_thb ?? existing.estimated_budget_thb,
        custom_notes: plan.custom_notes ?? existing.custom_notes ?? undefined,
        tags: plan.tags ?? JSON.parse(existing.tags || '[]'),
        likes_count: existing.likes_count,
        created_at: existing.created_at,
      };
    }
  }

  // INSERT new plan
  const id = plan.id || `trip-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const createdAt = new Date().toISOString();

  const newPlan: CommunityTripPlan = {
    id,
    trip_title: plan.trip_title || 'Tokyo Trip 2027',
    creator_name: plan.creator_name || 'Traveler',
    target_year: plan.target_year || 2027,
    target_month: plan.target_month || 11,
    duration_days: plan.duration_days || 7,
    destinations: plan.destinations || [],
    selected_flight: plan.selected_flight,
    selected_hotel_id: plan.selected_hotel_id,
    hotel_area: plan.hotel_area,
    estimated_budget_thb: plan.estimated_budget_thb || 38000,
    custom_notes: plan.custom_notes || '',
    tags: plan.tags || [`${plan.duration_days || 7} Days`],
    likes_count: 1,
    created_at: createdAt,
  };

  const stmt = sqlite.prepare(`
    INSERT INTO trip_plans (
      id, trip_title, creator_name, target_year, target_month,
      duration_days, destinations, selected_flight, selected_hotel_id, hotel_area,
      estimated_budget_thb, custom_notes, tags, likes_count, created_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    newPlan.id,
    newPlan.trip_title,
    newPlan.creator_name,
    newPlan.target_year,
    newPlan.target_month,
    newPlan.duration_days,
    JSON.stringify(newPlan.destinations),
    newPlan.selected_flight || null,
    newPlan.selected_hotel_id || null,
    newPlan.hotel_area || null,
    newPlan.estimated_budget_thb,
    newPlan.custom_notes || null,
    JSON.stringify(newPlan.tags),
    newPlan.likes_count,
    newPlan.created_at
  );

  return newPlan;
}

export function insertTripPlan(plan: Partial<CommunityTripPlan>): CommunityTripPlan {
  return upsertTripPlan(plan);
}
