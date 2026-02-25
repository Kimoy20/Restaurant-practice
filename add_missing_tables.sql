-- Add missing tables to fix foreign key constraint issues
-- Run this in Supabase SQL Editor

INSERT INTO public.tables (slug, name) VALUES
  ('table-4', 'Table 4'),
  ('table-5', 'Table 5'),
  ('table-6', 'Table 6')
ON CONFLICT (slug) DO NOTHING;
