-- Enquiries: every quote request, contact message and newsletter sign-up from the website.
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null unique,
  type        text not null check (type in ('quote', 'contact', 'newsletter')),
  status      text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'quoted', 'won', 'lost')),
  name        text,
  company     text,
  email       text not null,
  country     text,
  product     text,
  quantity    integer,
  material    text,
  finishes    text[],
  logo_type   text,
  colour      text,
  file_name   text,
  message     text,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status);

-- Locked down: with row level security on and no policies, only the website's server
-- (using the secret service-role key) can read or write. Browsers cannot.
alter table public.enquiries enable row level security;
