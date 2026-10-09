-- Visitor analytics for the portfolio.
--
-- One row per unique visitor (identified by a random id kept in the visitor's
-- localStorage), so a person who comes back many times is still counted once.
--
-- Security model:
--   * Tables are locked: anon/authenticated have no direct access at all.
--   * Visitors write only through track_visit() (SECURITY DEFINER).
--   * Stats are read only through get_visitor_stats(), which requires the
--     caller to be listed in public.admins.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.visitors (
  visitor_id   uuid primary key,
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  visit_count  integer     not null default 1,
  source       text,  -- utm_source / ref param / referrer host (first touch)
  landing_path text,
  language     text,
  timezone     text,
  device       text,  -- mobile | tablet | desktop
  browser      text,
  os           text
);

create index if not exists visitors_first_seen_idx on public.visitors (first_seen);
create index if not exists visitors_last_seen_idx on public.visitors (last_seen);

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.visitors enable row level security;
alter table public.admins enable row level security;

-- No policies on purpose: nobody reads or writes these tables directly.
revoke all on table public.visitors from anon, authenticated;
revoke all on table public.admins from anon, authenticated;

-- ---------------------------------------------------------------------------
-- is_admin(): is the current authenticated user an admin?
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- track_visit(): called by the public site, once per browser session.
-- A repeat visit increments visit_count only if 30+ minutes passed since the
-- last one, so refreshes don't inflate the numbers.
-- ---------------------------------------------------------------------------

create or replace function public.track_visit(
  p_visitor_id uuid,
  p_source     text default null,
  p_path       text default null,
  p_language   text default null,
  p_timezone   text default null,
  p_device     text default null,
  p_browser    text default null,
  p_os         text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_visitor_id is null then
    return;
  end if;

  insert into public.visitors as v
    (visitor_id, source, landing_path, language, timezone, device, browser, os)
  values (
    p_visitor_id,
    left(p_source, 200),
    left(p_path, 200),
    left(p_language, 20),
    left(p_timezone, 64),
    left(p_device, 16),
    left(p_browser, 32),
    left(p_os, 32)
  )
  on conflict (visitor_id) do update
    set visit_count = v.visit_count
          + case when v.last_seen < now() - interval '30 minutes' then 1 else 0 end,
        last_seen = now();
end;
$$;

revoke execute on function public.track_visit(uuid, text, text, text, text, text, text, text) from public;
grant execute on function public.track_visit(uuid, text, text, text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- exclude_visitor(): lets the admin remove their own browser from the stats.
-- ---------------------------------------------------------------------------

create or replace function public.exclude_visitor(p_visitor_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  delete from public.visitors where visitor_id = p_visitor_id;
end;
$$;

revoke execute on function public.exclude_visitor(uuid) from public, anon;
grant execute on function public.exclude_visitor(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- get_visitor_stats(): everything the dashboard needs, in one call.
-- ---------------------------------------------------------------------------

create or replace function public.get_visitor_stats(
  p_days     integer default 30,
  p_timezone text    default 'UTC'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days  integer := least(greatest(coalesce(p_days, 30), 1), 365);
  v_tz    text    := coalesce(p_timezone, 'UTC');
  v_today date;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  -- Fall back to UTC on an unknown timezone name.
  begin
    v_today := (now() at time zone v_tz)::date;
  exception when others then
    v_tz := 'UTC';
    v_today := (now() at time zone v_tz)::date;
  end;

  return jsonb_build_object(
    'total',        (select count(*) from public.visitors),
    'total_visits', (select coalesce(sum(visit_count), 0) from public.visitors),
    'returning',    (select count(*) from public.visitors where visit_count > 1),
    'today',        (select count(*) from public.visitors
                       where (first_seen at time zone v_tz)::date = v_today),
    'last_7_days',  (select count(*) from public.visitors
                       where first_seen >= now() - interval '7 days'),
    'last_30_days', (select count(*) from public.visitors
                       where first_seen >= now() - interval '30 days'),
    'active_24h',   (select count(*) from public.visitors
                       where last_seen >= now() - interval '24 hours'),

    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('date', d.day, 'count', coalesce(c.cnt, 0))
                                order by d.day), '[]'::jsonb)
      from (
        select generate_series((v_today - (v_days - 1))::timestamp, v_today::timestamp, interval '1 day')::date as day
      ) d
      left join (
        select (first_seen at time zone v_tz)::date as day, count(*) as cnt
        from public.visitors
        where first_seen >= now() - make_interval(days => v_days + 1)
        group by 1
      ) c on c.day = d.day
    ),

    'devices', (
      select coalesce(jsonb_agg(jsonb_build_object('label', s.label, 'count', s.cnt) order by s.cnt desc), '[]'::jsonb)
      from (select coalesce(device, 'unknown') as label, count(*) as cnt
            from public.visitors group by 1 order by 2 desc limit 8) s
    ),
    'browsers', (
      select coalesce(jsonb_agg(jsonb_build_object('label', s.label, 'count', s.cnt) order by s.cnt desc), '[]'::jsonb)
      from (select coalesce(browser, 'unknown') as label, count(*) as cnt
            from public.visitors group by 1 order by 2 desc limit 8) s
    ),
    'os', (
      select coalesce(jsonb_agg(jsonb_build_object('label', s.label, 'count', s.cnt) order by s.cnt desc), '[]'::jsonb)
      from (select coalesce(os, 'unknown') as label, count(*) as cnt
            from public.visitors group by 1 order by 2 desc limit 8) s
    ),
    'sources', (
      select coalesce(jsonb_agg(jsonb_build_object('label', s.label, 'count', s.cnt) order by s.cnt desc), '[]'::jsonb)
      from (select coalesce(source, 'direct') as label, count(*) as cnt
            from public.visitors group by 1 order by 2 desc limit 8) s
    ),
    'timezones', (
      select coalesce(jsonb_agg(jsonb_build_object('label', s.label, 'count', s.cnt) order by s.cnt desc), '[]'::jsonb)
      from (select coalesce(timezone, 'unknown') as label, count(*) as cnt
            from public.visitors group by 1 order by 2 desc limit 8) s
    ),

    'recent', (
      select coalesce(jsonb_agg(to_jsonb(r) order by r.last_seen desc), '[]'::jsonb)
      from (select first_seen, last_seen, visit_count, device, browser, os,
                   source, timezone, language, landing_path
            from public.visitors order by last_seen desc limit 25) r
    )
  );
end;
$$;

revoke execute on function public.get_visitor_stats(integer, text) from public, anon;
grant execute on function public.get_visitor_stats(integer, text) to authenticated;
