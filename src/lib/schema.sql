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
  project_type text default null,
  created_at  timestamptz default now()
);

-- Migration (ha a tábla már létezik):
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT NULL;

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
  status           text default 'Lead' check (status in ('Lead', 'Tárgyalás', 'Megerősített', 'Folyamatban', 'Sikeres üzlet')),
  notes            text default '',
  forecast_type    text default 'bevétel',
  for_client       text default '',
  vat_rate         integer default 0,
  net_amount       integer,
  created_at       timestamptz default now()
);

-- Migrációk (ha a tábla már létezik):
-- ALTER TABLE forecasts ADD COLUMN IF NOT EXISTS forecast_type TEXT DEFAULT 'bevétel';
-- ALTER TABLE forecasts DROP CONSTRAINT IF EXISTS forecasts_status_check;
-- ALTER TABLE forecasts ADD CONSTRAINT forecasts_status_check
--   CHECK (status IN ('Lead', 'Tárgyalás', 'Megerősített', 'Folyamatban', 'Sikeres üzlet'));
-- ALTER TABLE forecasts ADD COLUMN IF NOT EXISTS for_client TEXT DEFAULT '';
-- ALTER TABLE forecasts ADD COLUMN IF NOT EXISTS vat_rate INTEGER DEFAULT 0;
-- ALTER TABLE forecasts ADD COLUMN IF NOT EXISTS net_amount INTEGER;

alter table forecasts enable row level security;
create policy "Public access" on forecasts for all using (true);

-- ─── Egyéni bevételi kategóriák ──────────────────────────────
create table if not exists income_categories (
  id    uuid primary key default gen_random_uuid(),
  name  text unique not null
);

alter table income_categories enable row level security;
create policy "Public access" on income_categories for all using (true);

-- ─── Egyéni kiadási kategóriák ───────────────────────────────
create table if not exists expense_categories (
  id    uuid primary key default gen_random_uuid(),
  name  text unique not null
);

alter table expense_categories enable row level security;
create policy "Public access" on expense_categories for all using (true);
