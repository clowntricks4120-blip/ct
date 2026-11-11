-- Run once in Supabase SQL Editor after schema.sql.
create table if not exists public.links (
  id integer primary key,
  url text not null,
  updated_at timestamptz not null default now(),
  manual_override boolean not null default false,
  constraint links_canva_url check (url ~* '^https://([a-z0-9-]+\.)?canva\.com/')
);
alter table public.links add column if not exists manual_override boolean not null default false;
create table if not exists public.canva_settings (
  id integer primary key default 1 check (id=1),
  task1_url text not null default '',
  task2_url text not null default '',
  updated_at timestamptz not null default now()
);
create table if not exists public.canva_reports (
  report_day date not null,
  ip_hash text not null,
  report_count integer not null default 0,
  primary key(report_day,ip_hash)
);
grant select on public.links to anon, authenticated;
grant insert, update, delete on public.links to authenticated;
grant select on public.canva_settings to anon, authenticated;
grant insert, update, delete on public.canva_settings to authenticated;
alter table public.links enable row level security;
alter table public.canva_settings enable row level security;
alter table public.canva_reports enable row level security;
drop policy if exists "public read canva link" on public.links;
create policy "public read canva link" on public.links for select to anon,authenticated using (true);
drop policy if exists "admin manage canva link" on public.links;
create policy "admin manage canva link" on public.links for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public read canva settings" on public.canva_settings;
create policy "public read canva settings" on public.canva_settings for select to anon,authenticated using (true);
drop policy if exists "admin manage canva settings" on public.canva_settings;
create policy "admin manage canva settings" on public.canva_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.update_canva_link_automatically(p_url text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  if p_url !~* '^https://([a-z0-9-]+\.)?canva\.com/' then raise exception 'Invalid Canva URL'; end if;
  insert into public.links(id,url,updated_at,manual_override) values(1,p_url,now(),false)
  on conflict(id) do update set url=excluded.url,updated_at=now()
  where public.links.manual_override=false;
  return found;
end; $$;
revoke all on function public.update_canva_link_automatically(text) from public,anon,authenticated;
grant execute on function public.update_canva_link_automatically(text) to service_role;

create or replace function public.record_canva_report(p_ip_hash text,p_report_day date)
returns boolean language plpgsql security definer set search_path=public as $$
declare n integer;
begin
  insert into public.canva_reports(report_day,ip_hash,report_count) values(p_report_day,p_ip_hash,1)
  on conflict(report_day,ip_hash) do update set report_count=public.canva_reports.report_count+1
  returning report_count into n;
  return n <= 3;
end; $$;
revoke all on function public.record_canva_report(text,date) from public,authenticated;
grant execute on function public.record_canva_report(text,date) to anon;
