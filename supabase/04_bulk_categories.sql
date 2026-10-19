-- Run in Supabase SQL Editor before deploying. Keeps existing records intact.
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'apps';
UPDATE public.apps SET category='apps' WHERE category IS NULL OR category='';
-- Ensure your existing authenticated-admin RLS UPDATE policy allows updating category.
CREATE INDEX IF NOT EXISTS apps_category_published_idx ON public.apps(category,published,created_at DESC);
