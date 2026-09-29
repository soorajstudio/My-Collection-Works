-- ====================================================================
-- SUPABASE SCHEMA & INITIAL SEED FOR MY LIBRARY
-- Run this entire script in Supabase SQL Editor (1-Click Setup)
-- ====================================================================

-- 1. Create Tables
create table if not exists public.profiles (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null default 'user_sooraj_01',
  username text unique not null,
  email text unique not null,
  "displayName" text,
  "avatarUrl" text,
  "avatarKey" text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

create table if not exists public.books (
  id text primary key default gen_random_uuid()::text,
  "ownerId" text default 'user_sooraj_01',
  title text not null,
  author text not null,
  description text default '',
  category text not null,
  language text default 'English',
  "coverFileUrl" text,
  "coverFileKey" text,
  "coverImagePosition" text default 'center',
  "pdfFileUrl" text,
  "pdfFileKey" text,
  "pdfFileName" text,
  "totalPages" integer,
  "totalChapters" integer,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

create table if not exists public.reading_states (
  id text primary key default gen_random_uuid()::text,
  "userId" text default 'user_sooraj_01',
  "bookId" text not null references public.books(id) on delete cascade,
  status text not null default 'Not Started',
  "currentChapter" integer default 0,
  "currentPage" integer default 0,
  "progressPercentage" integer default 0,
  wishlist boolean default false,
  "lastReadAt" timestamptz,
  "completedAt" timestamptz,
  "updatedAt" timestamptz default now()
);

create table if not exists public.certificates (
  id text primary key default gen_random_uuid()::text,
  "ownerId" text default 'user_sooraj_01',
  title text not null,
  issuer text not null,
  "issueDate" text,
  "expiryDate" text,
  "credentialId" text,
  "credentialUrl" text,
  category text,
  "fileUrl" text,
  "fileKey" text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

create table if not exists public.projects (
  id text primary key default gen_random_uuid()::text,
  "ownerId" text default 'user_sooraj_01',
  title text not null,
  tagline text,
  description text,
  category text,
  status text default 'Completed',
  "githubUrl" text,
  "liveUrl" text,
  "iconUrl" text,
  technologies text[],
  screenshots text[],
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

-- 2. Storage Bucket for covers and attachments
insert into storage.buckets (id, name, public)
values ('vault_files', 'vault_files', true)
on conflict (id) do update set public = true;

-- 3. Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.reading_states enable row level security;
alter table public.certificates enable row level security;
alter table public.projects enable row level security;

drop policy if exists "Public access to profiles" on public.profiles;
create policy "Public access to profiles" on public.profiles for all using (true) with check (true);

drop policy if exists "Public access to books" on public.books;
create policy "Public access to books" on public.books for all using (true) with check (true);

drop policy if exists "Public access to reading_states" on public.reading_states;
create policy "Public access to reading_states" on public.reading_states for all using (true) with check (true);

drop policy if exists "Public access to certificates" on public.certificates;
create policy "Public access to certificates" on public.certificates for all using (true) with check (true);

drop policy if exists "Public access to projects" on public.projects;
create policy "Public access to projects" on public.projects for all using (true) with check (true);

drop policy if exists "Public access to storage objects" on storage.objects;
create policy "Public access to storage objects" on storage.objects for all using (bucket_id = 'vault_files') with check (bucket_id = 'vault_files');

-- 4. Seed Default Profile
insert into public.profiles ("userId", username, email, "displayName")
values ('user_sooraj_01', 'sooraj', 'sooraj@library.vault', 'Sooraj')
on conflict (username) do nothing;

-- 5. Seed Default Books
insert into public.books (id, "ownerId", title, author, description, category, language, "coverFileUrl", "totalChapters", "totalPages")
values
  ('book_01', 'user_sooraj_01', 'One Piece', 'Eiichiro Oda', 'Follows the legendary adventures of Monkey D. Luffy and the Straw Hat Pirates across the Grand Line in search of the ultimate treasure.', 'Manga', 'English', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', 1120, null),
  ('book_02', 'user_sooraj_01', 'Atomic Habits', 'James Clear', 'An easy & proven way to build good habits & break bad ones. Small, incremental changes lead to monumental life-changing results.', 'Other Books', 'English', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', null, 320),
  ('book_03', 'user_sooraj_01', 'Solo Leveling', 'Chugong', 'Known as the Weakest Hunter of All Mankind, Sung Jinwoo encounters a mysterious double dungeon that grants him a unique quest log to level up without limits.', 'Manhwa', 'Korean', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80', 179, null),
  ('book_04', 'user_sooraj_01', 'The Alchemist', 'Paulo Coelho', 'A magical fable about following your dream and listening to your heart. Santiago, an Andalusian shepherd boy, yearns to travel in search of worldly treasure.', 'Novel', 'English', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', null, 208),
  ('book_05', 'user_sooraj_01', 'Nano Machine', 'Jeolmu Hyeon', 'Cheon Yeo-Woon, an illegitimate prince of the Demonic Cult, receives an unexpected injection of futuristic nanotechnology from a mysterious descendant.', 'Manhwa', 'Korean', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', 215, null),
  ('book_06', 'user_sooraj_01', 'Attack on Titan', 'Hajime Isayama', 'Humanity lives behind colossal concentric walls to protect themselves from man-eating Titans. Eren Yeager vows to cleanse the earth of every last Titan.', 'Manga', 'Japanese', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', 139, null),
  ('book_07', 'user_sooraj_01', 'Death Note', 'Tsugumi Ohba & Takeshi Obata', 'High school genius Light Yagami discovers a supernatural notebook that grants him the ability to kill anyone whose name and face he knows.', 'Manga', 'English', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', 108, null),
  ('book_08', 'user_sooraj_01', 'Demon Slayer: Kimetsu no Yaiba', 'Koyoharu Gotouge', 'Tanjiro Kamado sets out to become a demon slayer after his family is slaughtered and his younger sister Nezuko is turned into a demon.', 'Manga', 'English', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80', 205, null),
  ('book_09', 'user_sooraj_01', 'Hell''s Paradise: Jigokuraku', 'Yuji Kaku', 'Gabimaru the Hollow, an immortal ninja on death row, is offered a full pardon if he can retrieve the Elixir of Life from a mythical supernatural island.', 'Manga', 'English', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 127, null),
  ('book_10', 'user_sooraj_01', 'Blue Lock', 'Muneyuki Kaneshiro & Yusuke Nomura', 'Japan initiates a radical training experiment called Blue Lock, gathering 300 high school forwards into a prison-like facility.', 'Manga', 'Japanese', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80', 270, null),
  ('book_11', 'user_sooraj_01', 'Sakamoto Days', 'Yuto Suzuki', 'Taro Sakamoto was once the ultimate legendary hitman. Now a convenience store owner with a family, he must fight assassins to keep peace.', 'Manga', 'English', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', 175, null)
on conflict (id) do nothing;

-- 6. Seed Reading States
insert into public.reading_states (id, "userId", "bookId", status, "currentChapter", "currentPage", "progressPercentage", wishlist)
values
  ('rs_01', 'user_sooraj_01', 'book_01', 'Reading', 1085, null, 97, false),
  ('rs_02', 'user_sooraj_01', 'book_02', 'Reading', null, 215, 67, false),
  ('rs_03', 'user_sooraj_01', 'book_03', 'Completed', 179, null, 100, false),
  ('rs_04', 'user_sooraj_01', 'book_04', 'Completed', null, 208, 100, false),
  ('rs_05', 'user_sooraj_01', 'book_05', 'Reading', 142, null, 66, false),
  ('rs_06', 'user_sooraj_01', 'book_06', 'Completed', 139, null, 100, false),
  ('rs_07', 'user_sooraj_01', 'book_07', 'Completed', 108, null, 100, false),
  ('rs_08', 'user_sooraj_01', 'book_08', 'Completed', 205, null, 100, false),
  ('rs_09', 'user_sooraj_01', 'book_09', 'Not Started', 0, null, 0, true),
  ('rs_10', 'user_sooraj_01', 'book_10', 'Reading', 210, null, 78, false),
  ('rs_11', 'user_sooraj_01', 'book_11', 'Not Started', 0, null, 0, true)
on conflict (id) do nothing;

-- 7. Seed Projects
insert into public.projects (id, "ownerId", title, tagline, description, status, technologies, "githubUrl", "iconUrl")
values
  ('proj_01', 'user_sooraj_01', 'Speed-Typing', 'Interactive typing speed and accuracy testing platform with real-time analytics.', 'A responsive typing test application that measures WPM and accuracy percentages.', 'Completed', array['JavaScript', 'HTML5', 'CSS3'], 'https://github.com/soorajstudio/Speed-Typing', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80'),
  ('proj_02', 'user_sooraj_01', 'FIFA 2026 Prediction', 'Machine Learning simulation model predicting FIFA World Cup 2026 match outcomes.', 'Predictive analytics model utilizing historical international football team performance data.', 'Completed', array['Python', 'Pandas', 'Scikit-Learn'], 'https://github.com/soorajstudio/fifa-2026-prediction', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80'),
  ('proj_03', 'user_sooraj_01', 'Traffic Detection with YOLO', 'Real-time vehicle detection, tracking, and traffic density estimation.', 'Computer vision pipeline using YOLOv8 deep learning architecture.', 'Completed', array['Python', 'YOLOv8', 'OpenCV'], 'https://github.com/soorajstudio/Traffic_Detection_with_YOLO', 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=120&auto=format&fit=crop&q=80')
on conflict (id) do nothing;
