-- Run in Supabase SQL Editor. Do not expose service-role keys in frontend.
create extension if not exists pgcrypto;
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.apps (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(name) between 1 and 120),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 version text not null default '', description text not null default '',
 icon_url text, screenshots jsonb not null default '[]'::jsonb,
 servers jsonb not null default '[]'::jsonb,
 published boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from public.admins where user_id=auth.uid())$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
alter table public.admins enable row level security;
alter table public.apps enable row level security;
create policy "admins read own row" on public.admins for select to authenticated using (user_id=auth.uid());
create policy "public read published apps" on public.apps for select to anon,authenticated using (published=true or public.is_admin());
create policy "admin insert apps" on public.apps for insert to authenticated with check (public.is_admin());
create policy "admin update apps" on public.apps for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete apps" on public.apps for delete to authenticated using (public.is_admin());
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$begin new.updated_at=now();return new;end$$;
create trigger apps_touch_updated_at before update on public.apps for each row execute function public.touch_updated_at();
-- AFTER creating your own user in Authentication > Users, run this in SQL Editor:
-- insert into public.admins(user_id) select id from auth.users where email='YOUR_ADMIN_EMAIL@example.com';
