-- Run once in Supabase SQL Editor BEFORE deploying this update.
-- Existing records remain unchanged and default to apps.
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'apps';
UPDATE public.apps SET category='apps' WHERE category IS NULL OR category='';
CREATE INDEX IF NOT EXISTS apps_category_published_idx ON public.apps(category,published,created_at DESC);
-- Previously imported tool entries without category: manually tag by known slugs.
UPDATE public.apps SET category='tools' WHERE slug IN ('green-neon-clown','blue-neon-dialog','pink-neon-dialog','mt-manager','antisplit');
