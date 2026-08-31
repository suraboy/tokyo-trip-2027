-- ==============================================================================
-- TOKYO TRIP 2027 - DEDICATED SCHEMA (ISOLATED FROM OTHER PROJECTS)
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Create Dedicated Isolated Schema for this project
CREATE SCHEMA IF NOT EXISTS tokyo_trip;

-- 2. Create Trip Plans Table under tokyo_trip schema
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

-- 3. Also create in public schema as fallback if needed
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

-- 4. Enable Row Level Security & Access Policies
ALTER TABLE tokyo_trip.trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read tokyo_trip" ON tokyo_trip.trip_plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert tokyo_trip" ON tokyo_trip.trip_plans FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read public" ON public.trip_plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert public" ON public.trip_plans FOR INSERT WITH CHECK (true);
