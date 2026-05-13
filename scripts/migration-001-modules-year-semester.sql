-- Migration 001: Add year and semester columns to modules table
-- Run this in your Supabase SQL Editor if you already have the existing schema.

ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS semester INTEGER;

-- Update existing modules with defaults (Year 3, Semester 1)
UPDATE public.modules
SET year = 3, semester = 1
WHERE year IS NULL OR semester IS NULL;
