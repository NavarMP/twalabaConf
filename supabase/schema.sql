-- SKSSF Twalaba Conference Database Schema
-- Run this in Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Guests Table
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule Table  
CREATE TABLE IF NOT EXISTS schedule (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day INTEGER NOT NULL CHECK (day IN (1, 2)),
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  type TEXT NOT NULL CHECK (type IN ('ceremony', 'session', 'special')),
  details JSONB,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public can read guests" ON guests FOR SELECT USING (true);
CREATE POLICY "Public can read schedule" ON schedule FOR SELECT USING (true);
CREATE POLICY "Public can read gallery" ON gallery FOR SELECT USING (true);

-- Authenticated users can manage content
CREATE POLICY "Authenticated users can insert guests" ON guests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update guests" ON guests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete guests" ON guests FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert schedule" ON schedule FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update schedule" ON schedule FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete schedule" ON schedule FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert gallery" ON gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update gallery" ON gallery FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete gallery" ON gallery FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guests_order ON guests(display_order);
CREATE INDEX IF NOT EXISTS idx_schedule_day_order ON schedule(day, display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery(display_order);
