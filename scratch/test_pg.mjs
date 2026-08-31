import pg from 'pg';

let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || '';
// Strip sslmode from query string to allow custom ssl object
connectionString = connectionString.replace(/[?&]sslmode=[^&]+/, '');

console.log('Connecting to PostgreSQL...');

const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function run() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL Database!');
    
    // Create table if not exists
    await client.query(`
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
    console.log('Table public.trip_plans is ready!');

    const res = await client.query('SELECT * FROM public.trip_plans ORDER BY created_at DESC LIMIT 10;');
    console.log(`Total rows in database: ${res.rows.length}`);
    console.log('Rows:', res.rows);

    client.release();
    pool.end();
  } catch (err) {
    console.error('Postgres Connection Error:', err);
    pool.end();
  }
}

run();
