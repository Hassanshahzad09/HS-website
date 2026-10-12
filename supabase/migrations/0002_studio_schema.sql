-- AI Packaging Studio schema (PRD section 30).
-- Every table has row level security on. A table with no policy can only be reached by the
-- website's server. Policies below open up exactly what a signed-in customer or staff member needs.

-- ───────────────────────────── helpers ─────────────────────────────

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ───────────────────────────── accounts ─────────────────────────────

create table public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  full_name          text,
  company            text,
  country_code       text,
  phone              text,
  role               text not null default 'customer' check (role in ('customer', 'sales', 'admin', 'super_admin')),
  marketing_consent  boolean not null default false,
  status             text not null default 'active' check (status in ('active', 'suspended')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);
create index profiles_role_idx on public.profiles (role) where role <> 'customer';
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

-- True when the signed-in user holds one of the given roles. Used by the policies below.
create or replace function public.has_role(variadic roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = any (roles) and status = 'active' and deleted_at is null
  );
$$;

-- A profile row is created automatically for every new sign-up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Customers can edit their own profile but never their own role or status.
create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and (select auth.uid()) is not null and not public.has_role('super_admin') then
    raise exception 'Only a super admin can change role or status';
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles for each row execute function public.protect_profile_fields();

create table public.anon_sessions (
  id                 uuid primary key default gen_random_uuid(),
  ip_hash            text,
  fingerprint_hash   text,
  generations_used   integer not null default 0,
  merged_user_id     uuid references public.profiles (id) on delete set null,
  expires_at         timestamptz not null default now() + interval '30 days',
  created_at         timestamptz not null default now()
);
create index anon_sessions_ip_hash_idx on public.anon_sessions (ip_hash);
create index anon_sessions_expires_at_idx on public.anon_sessions (expires_at);

-- ───────────────────────────── catalogue ─────────────────────────────

create table public.product_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  parent_id   uuid references public.product_categories (id) on delete set null,
  sort        integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger product_categories_updated_at before update on public.product_categories for each row execute function public.set_updated_at();

create table public.prompt_templates (
  id          uuid primary key default gen_random_uuid(),
  scope       text not null check (scope in ('global', 'product', 'mode')),
  product_id  uuid,
  module      text not null,
  version     integer not null default 1,
  body        text not null,
  is_active   boolean not null default false,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index prompt_templates_version_key on public.prompt_templates (scope, coalesce(product_id, '00000000-0000-0000-0000-000000000000'::uuid), module, version);
create trigger prompt_templates_updated_at before update on public.prompt_templates for each row execute function public.set_updated_at();

create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  category_id         uuid references public.product_categories (id) on delete set null,
  name                text not null,
  slug                text not null unique,
  status              text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  ai_enabled          boolean not null default false,
  moq                 integer,
  lead_time_text      text,
  short_description   text,
  description         text,
  default_scene       text,
  prompt_template_id  uuid references public.prompt_templates (id) on delete set null,
  seo_title           text,
  seo_description     text,
  sort                integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index products_status_idx on public.products (status);
create index products_category_id_idx on public.products (category_id);
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();

alter table public.prompt_templates
  add constraint prompt_templates_product_id_fkey foreign key (product_id) references public.products (id) on delete cascade;

create table public.attributes (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  label       text not null,
  input_type  text not null default 'select' check (input_type in ('select', 'multi', 'swatch', 'number', 'text')),
  help_text   text,
  sort        integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger attributes_updated_at before update on public.attributes for each row execute function public.set_updated_at();

create table public.attribute_values (
  id               uuid primary key default gen_random_uuid(),
  attribute_id     uuid not null references public.attributes (id) on delete cascade,
  key              text not null,
  label            text not null,
  swatch_url       text,
  hex              text,
  prompt_fragment  text,
  is_active        boolean not null default true,
  sort             integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (attribute_id, key)
);
create trigger attribute_values_updated_at before update on public.attribute_values for each row execute function public.set_updated_at();

create table public.product_attributes (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products (id) on delete cascade,
  attribute_id      uuid not null references public.attributes (id) on delete cascade,
  required          boolean not null default false,
  multi             boolean not null default false,
  max_select        integer,
  sort              integer not null default 0,
  default_value_id  uuid references public.attribute_values (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (product_id, attribute_id)
);
create index product_attributes_attribute_id_idx on public.product_attributes (attribute_id);
create trigger product_attributes_updated_at before update on public.product_attributes for each row execute function public.set_updated_at();

create table public.product_attribute_values (
  product_attribute_id  uuid not null references public.product_attributes (id) on delete cascade,
  attribute_value_id    uuid not null references public.attribute_values (id) on delete cascade,
  extra                 jsonb not null default '{}'::jsonb,
  primary key (product_attribute_id, attribute_value_id)
);
create index product_attribute_values_value_idx on public.product_attribute_values (attribute_value_id);

create table public.config_rules (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  rule_type   text not null check (rule_type in ('requires', 'excludes', 'limit')),
  condition   jsonb not null default '{}'::jsonb,
  effect      jsonb not null default '{}'::jsonb,
  message     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index config_rules_product_id_idx on public.config_rules (product_id);
create trigger config_rules_updated_at before update on public.config_rules for each row execute function public.set_updated_at();

-- ───────────────────────────── projects, logos, generations ─────────────────────────────

create table public.projects (
  id                   uuid primary key default gen_random_uuid(),
  owner_user_id        uuid references public.profiles (id) on delete cascade,
  anon_session_id      uuid references public.anon_sessions (id) on delete set null,
  name                 text not null default 'Untitled project',
  cover_generation_id  uuid,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz,
  check (owner_user_id is not null or anon_session_id is not null)
);
create index projects_owner_user_id_idx on public.projects (owner_user_id);
create index projects_anon_session_id_idx on public.projects (anon_session_id);
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

create table public.project_configurations (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects (id) on delete cascade,
  product_id      uuid references public.products (id) on delete set null,
  product_slug    text,
  configuration   jsonb not null default '{}'::jsonb,
  config_version  integer not null default 1,
  label           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index project_configurations_project_id_idx on public.project_configurations (project_id);
create trigger project_configurations_updated_at before update on public.project_configurations for each row execute function public.set_updated_at();

create table public.uploaded_assets (
  id               uuid primary key default gen_random_uuid(),
  owner_user_id    uuid references public.profiles (id) on delete cascade,
  anon_session_id  uuid references public.anon_sessions (id) on delete set null,
  kind             text not null check (kind in ('logo', 'quote_attachment')),
  storage_path     text not null,
  original_name    text,
  mime             text,
  width            integer,
  height           integer,
  has_alpha        boolean,
  size_bytes       bigint,
  sha256           text,
  warnings         jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz,
  check (owner_user_id is not null or anon_session_id is not null)
);
create index uploaded_assets_owner_user_id_idx on public.uploaded_assets (owner_user_id);
create index uploaded_assets_anon_session_id_idx on public.uploaded_assets (anon_session_id);
create index uploaded_assets_sha256_idx on public.uploaded_assets (sha256);
create trigger uploaded_assets_updated_at before update on public.uploaded_assets for each row execute function public.set_updated_at();

create table public.generations (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references public.profiles (id) on delete cascade,
  anon_session_id           uuid references public.anon_sessions (id) on delete set null,
  project_id                uuid references public.projects (id) on delete set null,
  project_configuration_id  uuid references public.project_configurations (id) on delete set null,
  product_id                uuid references public.products (id) on delete set null,
  product_slug              text,
  config_snapshot           jsonb not null default '{}'::jsonb,
  logo_asset_id             uuid references public.uploaded_assets (id) on delete set null,
  parent_generation_id      uuid references public.generations (id) on delete set null,
  mode                      text not null default 'quick' check (mode in ('quick', 'premium', 'regenerate', 'modify', 'angle')),
  status                    text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  provider                  text,
  model                     text,
  prompt_text               text,
  prompt_template_ids       uuid[],
  prompt_hash               text,
  error_code                text,
  error_message             text,
  latency_ms                integer,
  cost_usd                  numeric(10, 5),
  credits_cost              integer not null default 0,
  idempotency_key           text unique,
  rating                    smallint check (rating between 1 and 5),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  completed_at              timestamptz,
  check (user_id is not null or anon_session_id is not null)
);
create index generations_user_created_idx on public.generations (user_id, created_at desc);
create index generations_anon_session_id_idx on public.generations (anon_session_id);
create index generations_project_id_idx on public.generations (project_id);
create index generations_status_idx on public.generations (status);
create trigger generations_updated_at before update on public.generations for each row execute function public.set_updated_at();

alter table public.projects
  add constraint projects_cover_generation_id_fkey foreign key (cover_generation_id) references public.generations (id) on delete set null;

create table public.generation_outputs (
  id                 uuid primary key default gen_random_uuid(),
  generation_id      uuid not null references public.generations (id) on delete cascade,
  storage_path       text not null,
  preview_path       text,
  thumb_path         text,
  width              integer,
  height             integer,
  bytes              bigint,
  is_public_gallery  boolean not null default false,
  created_at         timestamptz not null default now()
);
create index generation_outputs_generation_id_idx on public.generation_outputs (generation_id);

create table public.generation_reports (
  id             uuid primary key default gen_random_uuid(),
  generation_id  uuid not null references public.generations (id) on delete cascade,
  user_id        uuid references public.profiles (id) on delete set null,
  reason         text not null,
  note           text,
  status         text not null default 'open' check (status in ('open', 'reviewed', 'refunded', 'dismissed')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index generation_reports_generation_id_idx on public.generation_reports (generation_id);
create trigger generation_reports_updated_at before update on public.generation_reports for each row execute function public.set_updated_at();

-- ───────────────────────────── plans and credits ─────────────────────────────

create table public.plans (
  id               uuid primary key default gen_random_uuid(),
  key              text not null unique,
  name             text not null,
  monthly_credits  integer not null default 0,
  price_cents      integer not null default 0,
  currency         text not null default 'USD',
  "interval"       text not null default 'none' check ("interval" in ('none', 'one_off', 'month', 'year')),
  features         jsonb not null default '{}'::jsonb,
  is_active        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger plans_updated_at before update on public.plans for each row execute function public.set_updated_at();

create table public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  plan_id             uuid not null references public.plans (id),
  provider            text,
  provider_sub_id     text unique,
  status              text not null default 'active' check (status in ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  current_period_end  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index subscriptions_user_id_idx on public.subscriptions (user_id);
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

-- Credits are a ledger: the balance is the sum of the rows. Positive adds, negative takes away.
create table public.credit_ledger (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles (id) on delete cascade,
  anon_session_id  uuid references public.anon_sessions (id) on delete set null,
  type             text not null check (type in ('grant', 'reserve', 'debit', 'release', 'refund', 'expire', 'adjust')),
  amount           integer not null,
  generation_id    uuid references public.generations (id) on delete set null,
  reason           text,
  created_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  check (user_id is not null or anon_session_id is not null)
);
create index credit_ledger_user_id_idx on public.credit_ledger (user_id, created_at desc);
create index credit_ledger_anon_session_id_idx on public.credit_ledger (anon_session_id);
create index credit_ledger_generation_id_idx on public.credit_ledger (generation_id);

create view public.credit_balances with (security_invoker = true) as
select
  user_id,
  coalesce(sum(amount), 0)::integer as balance,
  coalesce(-sum(amount) filter (where type in ('reserve', 'release')), 0)::integer as reserved
from public.credit_ledger
where user_id is not null
group by user_id;

-- ───────────────────────────── leads and quotes ─────────────────────────────

create table public.leads (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null,
  name               text,
  company            text,
  country_code       text,
  phone              text,
  status             text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'quotation_sent', 'negotiation', 'won', 'lost', 'archived')),
  score              integer not null default 0,
  owner_user_id      uuid references public.profiles (id) on delete set null,
  next_follow_up_at  timestamptz,
  lost_reason        text check (lost_reason in ('price', 'moq', 'lead_time', 'shipping', 'no_response', 'chose_competitor', 'other')),
  won_value_cents    bigint,
  source             text,
  first_quote_at     timestamptz,
  last_activity_at   timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (status <> 'lost' or lost_reason is not null)
);
create unique index leads_email_key on public.leads (lower(email));
create index leads_status_idx on public.leads (status);
create index leads_owner_user_id_idx on public.leads (owner_user_id);
create index leads_next_follow_up_at_idx on public.leads (next_follow_up_at);
create trigger leads_updated_at before update on public.leads for each row execute function public.set_updated_at();

create table public.quotes (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique,
  user_id           uuid references public.profiles (id) on delete set null,
  anon_session_id   uuid references public.anon_sessions (id) on delete set null,
  lead_id           uuid references public.leads (id) on delete set null,
  name              text,
  company           text,
  email             text not null,
  phone             text,
  country_code      text,
  shipping_country  text,
  target_date       date,
  message           text,
  status            text not null default 'received' check (status in ('received', 'in_review', 'quotation_sent', 'closed')),
  consent_at        timestamptz,
  source            text,
  utm               jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index quotes_created_at_idx on public.quotes (created_at desc);
create index quotes_user_id_idx on public.quotes (user_id);
create index quotes_lead_id_idx on public.quotes (lead_id);
create trigger quotes_updated_at before update on public.quotes for each row execute function public.set_updated_at();

create table public.quote_items (
  id               uuid primary key default gen_random_uuid(),
  quote_id         uuid not null references public.quotes (id) on delete cascade,
  product_id       uuid references public.products (id) on delete set null,
  product_slug     text,
  generation_id    uuid references public.generations (id) on delete set null,
  config_snapshot  jsonb not null default '{}'::jsonb,
  quantity         integer,
  size_text        text,
  notes            text,
  image_path       text,
  created_at       timestamptz not null default now()
);
create index quote_items_quote_id_idx on public.quote_items (quote_id);

create table public.lead_notes (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  author_id   uuid references public.profiles (id) on delete set null,
  body        text not null,
  type        text not null default 'note' check (type in ('note', 'status_change', 'email')),
  created_at  timestamptz not null default now()
);
create index lead_notes_lead_id_idx on public.lead_notes (lead_id, created_at desc);

-- ───────────────────────────── content, analytics, settings ─────────────────────────────

create table public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  excerpt          text,
  body             jsonb,
  cover            text,
  author_id        uuid references public.profiles (id) on delete set null,
  status           text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at     timestamptz,
  seo_title        text,
  seo_description  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger blog_posts_updated_at before update on public.blog_posts for each row execute function public.set_updated_at();

create table public.seo_pages (
  id             uuid primary key default gen_random_uuid(),
  type           text not null check (type in ('finish', 'industry', 'combination', 'market', 'tool')),
  slug           text not null unique,
  title          text not null,
  h1             text,
  body           jsonb,
  faqs           jsonb not null default '[]'::jsonb,
  related        jsonb not null default '[]'::jsonb,
  product_id     uuid references public.products (id) on delete set null,
  canonical      text,
  noindex        boolean not null default false,
  og_image       text,
  status         text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  quality_check  jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger seo_pages_updated_at before update on public.seo_pages for each row execute function public.set_updated_at();

create table public.analytics_events (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  user_id          uuid references public.profiles (id) on delete set null,
  anon_session_id  uuid references public.anon_sessions (id) on delete set null,
  properties       jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);
create index analytics_events_name_created_idx on public.analytics_events (name, created_at desc);

create table public.system_settings (
  key         text primary key,
  value       jsonb not null,
  updated_by  uuid references public.profiles (id) on delete set null,
  updated_at  timestamptz not null default now()
);
create trigger system_settings_updated_at before update on public.system_settings for each row execute function public.set_updated_at();

create table public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  entity      text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log (entity, entity_id);

create table public.ai_model_prices (
  id              uuid primary key default gen_random_uuid(),
  provider        text not null,
  model           text not null,
  unit            text not null,
  price_usd       numeric(12, 6) not null,
  effective_from  timestamptz not null default now(),
  unique (provider, model, unit, effective_from)
);

-- ───────────────────────────── row level security ─────────────────────────────

alter table public.profiles enable row level security;
alter table public.anon_sessions enable row level security;
alter table public.product_categories enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.products enable row level security;
alter table public.attributes enable row level security;
alter table public.attribute_values enable row level security;
alter table public.product_attributes enable row level security;
alter table public.product_attribute_values enable row level security;
alter table public.config_rules enable row level security;
alter table public.projects enable row level security;
alter table public.project_configurations enable row level security;
alter table public.uploaded_assets enable row level security;
alter table public.generations enable row level security;
alter table public.generation_outputs enable row level security;
alter table public.generation_reports enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.leads enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.lead_notes enable row level security;
alter table public.blog_posts enable row level security;
alter table public.seo_pages enable row level security;
alter table public.analytics_events enable row level security;
alter table public.system_settings enable row level security;
alter table public.audit_log enable row level security;
alter table public.ai_model_prices enable row level security;

-- Table privileges. Row level security above still decides which rows each role can touch.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.product_categories, public.products, public.attributes, public.attribute_values,
  public.product_attributes, public.product_attribute_values, public.config_rules, public.plans,
  public.blog_posts, public.seo_pages, public.generation_outputs to anon;
revoke all on public.enquiries from anon;

-- Accounts
create policy "own profile or staff: read" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.has_role('sales', 'admin', 'super_admin'));
create policy "own profile: update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "admin: manage profiles" on public.profiles for update to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));

-- Catalogue: anyone can read what is live, admins manage everything.
create policy "public: read categories" on public.product_categories for select to anon, authenticated using (true);
create policy "public: read live products" on public.products for select to anon, authenticated
  using (status = 'active' or public.has_role('sales', 'admin', 'super_admin'));
create policy "public: read attributes" on public.attributes for select to anon, authenticated using (true);
create policy "public: read attribute values" on public.attribute_values for select to anon, authenticated using (true);
create policy "public: read product attributes" on public.product_attributes for select to anon, authenticated using (true);
create policy "public: read product attribute values" on public.product_attribute_values for select to anon, authenticated using (true);
create policy "public: read config rules" on public.config_rules for select to anon, authenticated using (true);
create policy "public: read active plans" on public.plans for select to anon, authenticated
  using (is_active or public.has_role('admin', 'super_admin'));

create policy "admin: write categories" on public.product_categories for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));
create policy "admin: write products" on public.products for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));
create policy "admin: write attributes" on public.attributes for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));
create policy "admin: write attribute values" on public.attribute_values for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));
create policy "admin: write product attributes" on public.product_attributes for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));
create policy "admin: write product attribute values" on public.product_attribute_values for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));
create policy "admin: write config rules" on public.config_rules for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));
create policy "admin: write plans" on public.plans for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));
create policy "admin: prompt templates" on public.prompt_templates for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));
create policy "admin: model prices" on public.ai_model_prices for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));

-- Projects and logos: customers manage their own.
create policy "own projects" on public.projects for all to authenticated
  using (owner_user_id = (select auth.uid())) with check (owner_user_id = (select auth.uid()));
create policy "staff: read projects" on public.projects for select to authenticated
  using (public.has_role('sales', 'admin', 'super_admin'));

create policy "own project configurations" on public.project_configurations for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));
create policy "staff: read project configurations" on public.project_configurations for select to authenticated
  using (public.has_role('sales', 'admin', 'super_admin'));

create policy "own assets: read" on public.uploaded_assets for select to authenticated
  using (owner_user_id = (select auth.uid()) or public.has_role('admin', 'super_admin'));
create policy "own assets: update" on public.uploaded_assets for update to authenticated
  using (owner_user_id = (select auth.uid())) with check (owner_user_id = (select auth.uid()));

-- Generations and credits: customers can read their own. Only the server writes, because credits are involved.
create policy "own generations: read" on public.generations for select to authenticated
  using (user_id = (select auth.uid()) or public.has_role('sales', 'admin', 'super_admin'));

create policy "outputs: read own or gallery" on public.generation_outputs for select to anon, authenticated
  using (
    is_public_gallery
    or exists (select 1 from public.generations g where g.id = generation_id and g.user_id = (select auth.uid()))
    or public.has_role('sales', 'admin', 'super_admin')
  );

create policy "own reports: read" on public.generation_reports for select to authenticated
  using (user_id = (select auth.uid()) or public.has_role('admin', 'super_admin'));
create policy "own reports: create" on public.generation_reports for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.generations g where g.id = generation_id and g.user_id = (select auth.uid()))
  );
create policy "admin: update reports" on public.generation_reports for update to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));

create policy "own subscriptions: read" on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()) or public.has_role('admin', 'super_admin'));
create policy "own credits: read" on public.credit_ledger for select to authenticated
  using (user_id = (select auth.uid()) or public.has_role('admin', 'super_admin'));

-- Leads and quotes: sales and admins work them, customers see their own quotes.
create policy "staff: leads" on public.leads for all to authenticated
  using (public.has_role('sales', 'admin', 'super_admin')) with check (public.has_role('sales', 'admin', 'super_admin'));
create policy "staff: lead notes" on public.lead_notes for all to authenticated
  using (public.has_role('sales', 'admin', 'super_admin')) with check (public.has_role('sales', 'admin', 'super_admin'));

create policy "own quotes: read" on public.quotes for select to authenticated
  using (user_id = (select auth.uid()) or public.has_role('sales', 'admin', 'super_admin'));
create policy "staff: update quotes" on public.quotes for update to authenticated
  using (public.has_role('sales', 'admin', 'super_admin')) with check (public.has_role('sales', 'admin', 'super_admin'));

create policy "own quote items: read" on public.quote_items for select to authenticated
  using (
    exists (select 1 from public.quotes q where q.id = quote_id and q.user_id = (select auth.uid()))
    or public.has_role('sales', 'admin', 'super_admin')
  );

create policy "staff: enquiries read" on public.enquiries for select to authenticated
  using (public.has_role('sales', 'admin', 'super_admin'));
create policy "staff: enquiries update" on public.enquiries for update to authenticated
  using (public.has_role('sales', 'admin', 'super_admin')) with check (public.has_role('sales', 'admin', 'super_admin'));

-- Content: published pages are public, admins manage.
create policy "public: read published posts" on public.blog_posts for select to anon, authenticated
  using (status = 'published' or public.has_role('admin', 'super_admin'));
create policy "admin: write posts" on public.blog_posts for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));
create policy "public: read published pages" on public.seo_pages for select to anon, authenticated
  using (status = 'published' or public.has_role('admin', 'super_admin'));
create policy "admin: write pages" on public.seo_pages for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));

-- Settings and logs
create policy "admin: read analytics" on public.analytics_events for select to authenticated
  using (public.has_role('admin', 'super_admin'));
create policy "admin: read settings" on public.system_settings for select to authenticated
  using (public.has_role('admin', 'super_admin'));
create policy "super admin: write settings" on public.system_settings for all to authenticated
  using (public.has_role('super_admin')) with check (public.has_role('super_admin'));
create policy "admin: read audit log" on public.audit_log for select to authenticated
  using (public.has_role('admin', 'super_admin'));

-- anon_sessions has no policy on purpose: only the server can touch it.

-- Internal functions are not callable through the public API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_fields() from public, anon, authenticated;
-- has_role stays callable by visitors too, because the public read policies call it.
revoke execute on function public.has_role(text[]) from public;
grant execute on function public.has_role(text[]) to anon, authenticated, service_role;

-- ───────────────────────────── private file storage ─────────────────────────────

-- Private buckets. No storage policies: files are only served through short-lived signed links.
insert into storage.buckets (id, name, public) values ('logos', 'logos', false), ('generations', 'generations', false)
on conflict (id) do nothing;

-- ───────────────────────────── starting plans ─────────────────────────────

-- Indicative figures from the pricing page. Paid plans stay switched off until they go on sale.
insert into public.plans (key, name, monthly_credits, price_cents, "interval", is_active, features) values
  ('guest', 'Guest',        0,   0,    'none',    true,  '{"free_previews": 2, "watermark": true}'),
  ('free',  'Free account', 0,   0,    'none',    true,  '{"signup_credits": 5, "quote_bonus_credits": 10, "watermark": true, "projects": true}'),
  ('pack',  'Credit pack',  0,   900,  'one_off', false, '{"credits": 50, "watermark": false, "premium": true}'),
  ('pro',   'Pro',          200, 2900, 'month',   false, '{"watermark": false, "premium": true, "brand_kits": true}')
on conflict (key) do nothing;
