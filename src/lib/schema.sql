-- Scrollers Pénzügyi App — Supabase séma
-- Futtatd a Supabase Dashboard > SQL Editor-ban

-- ─── Tranzakciók ─────────────────────────────────────────────
create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  date        text not null,
  type        text not null check (type in ('bevétel', 'kiadás')),
  category    text not null,
  partner     text default '',
  amount      integer not null,
  vat_rate    integer default 27,
  net_amount  integer,
  status      text default 'fizetve' check (status in ('fizetve', 'kifizetetlen')),
  notes       text default '',
  created_at  timestamptz default now()
);

-- Row Level Security
alter table transactions enable row level security;
create policy "Public access" on transactions for all using (true);

-- ─── Forecast tételek ────────────────────────────────────────
create table if not exists forecasts (
  id               uuid primary key default gen_random_uuid(),
  client_name      text not null,
  project_type     text default '',
  expected_amount  integer not null,
  expected_date    text,
  status           text default 'Lead' check (status in ('Lead', 'Tárgyalás', 'Megerősített', 'Folyamatban')),
  notes            text default '',
  created_at       timestamptz default now()
);

alter table forecasts enable row level security;
create policy "Public access" on forecasts for all using (true);

-- ─── Egyéni bevételi kategóriák ──────────────────────────────
create table if not exists income_categories (
  id    uuid primary key default gen_random_uuid(),
  name  text unique not null
);

alter table income_categories enable row level security;
create policy "Public access" on income_categories for all using (true);
