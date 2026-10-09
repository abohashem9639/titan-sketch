-- Editable site content (CMS).
--
-- Every section of the portfolio is one row holding a JSON document.
--   * Anyone can read the content (the public site renders it).
--   * Only admins (public.admins) can insert/update it.
--   * Every change is snapshotted into content_revisions (newest 50 per
--     section are kept), so any edit can be rolled back from the admin panel.
--   * Images live in the public "site-assets" storage bucket; only admins
--     can upload, replace, or delete them.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.site_content (
  section    text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  constraint site_content_section_check check (section in (
    'general', 'hero', 'about', 'skills', 'experience',
    'projects', 'education', 'additional', 'contact'
  )),
  constraint site_content_data_is_object check (jsonb_typeof(data) = 'object')
);

create table if not exists public.content_revisions (
  id         bigint generated always as identity primary key,
  section    text not null,
  data       jsonb not null,
  note       text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists content_revisions_section_created_idx
  on public.content_revisions (section, created_at desc);

alter table public.site_content enable row level security;
alter table public.content_revisions enable row level security;

revoke all on table public.site_content from anon, authenticated;
revoke all on table public.content_revisions from anon, authenticated;

grant select on table public.site_content to anon, authenticated;
grant insert, update on table public.site_content to authenticated;
grant select on table public.content_revisions to authenticated;

drop policy if exists "site_content: public read" on public.site_content;
create policy "site_content: public read" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "site_content: admin insert" on public.site_content;
create policy "site_content: admin insert" on public.site_content
  for insert to authenticated with check (public.is_admin());

drop policy if exists "site_content: admin update" on public.site_content;
create policy "site_content: admin update" on public.site_content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "content_revisions: admin read" on public.content_revisions;
create policy "content_revisions: admin read" on public.content_revisions
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Triggers: keep updated_at fresh and snapshot every change
-- ---------------------------------------------------------------------------

create or replace function public.site_content_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.site_content_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.data = old.data then
    return null;
  end if;

  insert into public.content_revisions (section, data, note, created_by)
  values (
    new.section,
    new.data,
    nullif(current_setting('app.revision_note', true), ''),
    auth.uid()
  );

  -- Keep the newest 50 revisions per section.
  delete from public.content_revisions r
  where r.section = new.section
    and r.id not in (
      select k.id from public.content_revisions k
      where k.section = new.section
      order by k.created_at desc, k.id desc
      limit 50
    );

  return null;
end;
$$;

revoke execute on function public.site_content_touch() from public, anon, authenticated;
revoke execute on function public.site_content_snapshot() from public, anon, authenticated;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before insert or update on public.site_content
  for each row execute function public.site_content_touch();

drop trigger if exists site_content_snapshot on public.site_content;
create trigger site_content_snapshot
  after insert or update on public.site_content
  for each row execute function public.site_content_snapshot();

-- ---------------------------------------------------------------------------
-- Storage: public image bucket, admin-only writes
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets', 'site-assets', true, 5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site-assets: admin read" on storage.objects;
create policy "site-assets: admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "site-assets: admin insert" on storage.objects;
create policy "site-assets: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "site-assets: admin update" on storage.objects;
create policy "site-assets: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "site-assets: admin delete" on storage.objects;
create policy "site-assets: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-assets' and public.is_admin());
