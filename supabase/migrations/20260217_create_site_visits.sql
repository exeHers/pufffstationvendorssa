create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visited_at timestamptz not null default now(),
  count integer not null default 1,
  visits integer not null default 1,
  total integer not null default 1,
  path text,
  user_agent text,
  ip_address text
);

create index if not exists site_visits_visited_at_idx on public.site_visits (visited_at desc);
