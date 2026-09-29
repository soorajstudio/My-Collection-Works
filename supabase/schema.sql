-- ================================================================
-- MY LIBRARY - SUPABASE DATABASE SCHEMA & STORAGE SETUP
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xflvrwxzyobmkpqvhjkf/sql
-- ================================================================

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  avatar_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  cover_file_url TEXT,
  cover_file_key TEXT,
  cover_image_position TEXT DEFAULT 'center',
  pdf_file_url TEXT,
  pdf_file_key TEXT,
  pdf_file_name TEXT,
  total_pages INTEGER,
  total_chapters INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create reading_states table
CREATE TABLE IF NOT EXISTS public.reading_states (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  book_id TEXT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Not Started',
  current_chapter INTEGER DEFAULT 0,
  current_page INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  wishlist BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT,
  expiry_date TEXT,
  credential_id TEXT,
  credential_url TEXT,
  category TEXT,
  file_url TEXT,
  file_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  category TEXT,
  status TEXT,
  github_url TEXT,
  live_url TEXT,
  icon_url TEXT,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  screenshots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) with public access policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public user_profiles access') THEN
    CREATE POLICY "Public user_profiles access" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public books access') THEN
    CREATE POLICY "Public books access" ON public.books FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public reading_states access') THEN
    CREATE POLICY "Public reading_states access" ON public.reading_states FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public certificates access') THEN
    CREATE POLICY "Public certificates access" ON public.certificates FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public projects access') THEN
    CREATE POLICY "Public projects access" ON public.projects FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 7. Storage Bucket setup for vault_files (covers, PDFs, avatars)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vault_files', 'vault_files', true)
ON CONFLICT (id) DO NOTHING;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public select vault_files' AND tablename = 'objects') THEN
    CREATE POLICY "Public select vault_files" ON storage.objects FOR SELECT USING (bucket_id = 'vault_files');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert vault_files' AND tablename = 'objects') THEN
    CREATE POLICY "Public insert vault_files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vault_files');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public update vault_files' AND tablename = 'objects') THEN
    CREATE POLICY "Public update vault_files" ON storage.objects FOR UPDATE USING (bucket_id = 'vault_files');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public delete vault_files' AND tablename = 'objects') THEN
    CREATE POLICY "Public delete vault_files" ON storage.objects FOR DELETE USING (bucket_id = 'vault_files');
  END IF;
END $$;

-- 8. Seed Initial Profile and Library Books
INSERT INTO public.user_profiles (user_id, username, email, display_name, avatar_url)
VALUES ('sooraj_user', 'sooraj', 'soorajmsofficial333@email.com', 'Sooraj', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.books (id, owner_id, title, author, description, category, language, cover_file_url, cover_image_position, total_chapters, total_pages)
VALUES 
  ('book_one_piece', 'sooraj_user', 'One Piece', 'Eiichiro Oda', 'Follows the legendary adventures of Monkey D. Luffy and the Straw Hat Pirates across the Grand Line.', 'Manga', 'English', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', 'top', 1120, NULL),
  ('book_atomic_habits', 'sooraj_user', 'Atomic Habits', 'James Clear', 'An easy and proven way to build good habits and break bad ones.', 'Other Books', 'English', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 'center', NULL, 320)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reading_states (id, user_id, book_id, status, current_chapter, current_page, progress_percentage, wishlist)
VALUES 
  ('rs_one_piece', 'sooraj_user', 'book_one_piece', 'Reading', 1085, 0, 97, FALSE),
  ('rs_atomic_habits', 'sooraj_user', 'book_atomic_habits', 'Completed', 0, 320, 100, FALSE)
ON CONFLICT (id) DO NOTHING;
