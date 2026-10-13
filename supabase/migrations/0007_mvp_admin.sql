-- MVP build (PRD 1D.3): admin users list, Studio safety limits and the KPI dashboard.

-- ───────────── email on the profile, so staff can see who an account belongs to ─────────────

alter table public.profiles add column email text;
update public.profiles p set email = u.email from auth.users u where u.id = p.id;
create index profiles_email_idx on public.profiles (lower(email));

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), new.email)
  on conflict (id) do nothing;
  return new;
end $$;

create or replace function public.sync_profile_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end $$;
create trigger on_auth_user_email_changed after update of email on auth.users
  for each row execute function public.sync_profile_email();
revoke execute on function public.sync_profile_email() from public, anon, authenticated;

-- Email is copied from the login record, so a customer cannot edit it on their profile.
create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is not null then
    if (new.role is distinct from old.role or new.status is distinct from old.status) and not public.has_role('super_admin') then
      raise exception 'Only a super admin can change role or status';
    end if;
    new.email = old.email;
  end if;
  return new;
end $$;

-- ───────────── Studio safety limits (configurable business decisions) ─────────────

insert into public.system_settings (key, value) values
  ('studio', '{"daily_generation_cap": 500, "free_project_limit": 10}')
on conflict (key) do nothing;

-- ───────────── KPI dashboard (PRD section 25, admin overview) ─────────────

create or replace function public.admin_kpis(p_from timestamptz, p_to timestamptz) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
begin
  if not public.has_role('sales', 'admin', 'super_admin') then
    raise exception 'Staff only';
  end if;

  select jsonb_build_object(
    'new_users',        (select count(*) from public.profiles where created_at >= p_from and created_at < p_to),
    'active_users',     (select count(distinct user_id) from public.generations where user_id is not null and created_at >= p_from and created_at < p_to),
    'guest_sessions',   (select count(distinct anon_session_id) from public.generations where anon_session_id is not null and created_at >= p_from and created_at < p_to),
    'generations_ok',   (select count(*) from public.generations where status = 'succeeded' and created_at >= p_from and created_at < p_to),
    'generations_failed', (select count(*) from public.generations where status = 'failed' and created_at >= p_from and created_at < p_to),
    'ai_cost_usd',      (select coalesce(sum(cost_usd), 0) from public.generations where created_at >= p_from and created_at < p_to),
    'credits_used',     (select coalesce(-sum(amount), 0) from public.credit_ledger where type = 'debit' and created_at >= p_from and created_at < p_to),
    'credits_granted',  (select coalesce(sum(amount), 0) from public.credit_ledger where type = 'grant' and created_at >= p_from and created_at < p_to),
    'limit_hits',       (select count(*) from public.analytics_events where name = 'studio_limit_reached' and created_at >= p_from and created_at < p_to),
    'quotes',           (select count(*) from public.quotes where created_at >= p_from and created_at < p_to),
    'contact_messages', (select count(*) from public.enquiries where type = 'contact' and created_at >= p_from and created_at < p_to),
    'newsletter',       (select count(*) from public.enquiries where type = 'newsletter' and created_at >= p_from and created_at < p_to),
    'new_leads',        (select count(*) from public.leads where created_at >= p_from and created_at < p_to),
    'won',              (select count(*) from public.leads where status = 'won' and updated_at >= p_from and updated_at < p_to),
    'studio_users_who_quoted', (
      select count(distinct g.user_id) from public.generations g
      where g.user_id is not null and g.created_at >= p_from and g.created_at < p_to
        and exists (select 1 from public.quotes q where q.user_id = g.user_id and q.created_at >= p_from and q.created_at < p_to)
    ),
    'leads_by_status',  (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb) from (select status, count(*) n from public.leads group by status) s),
    'top_products',     (
      select coalesce(jsonb_agg(jsonb_build_object('product', product_slug, 'n', n) order by n desc), '[]'::jsonb)
      from (select product_slug, count(*) n from public.generations where status = 'succeeded' and created_at >= p_from and created_at < p_to and product_slug is not null group by product_slug order by n desc limit 6) t
    ),
    'daily',            (
      select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'generations', (select count(*) from public.generations g where g.status = 'succeeded' and g.created_at >= d and g.created_at < d + interval '1 day'), 'quotes', (select count(*) from public.quotes q where q.created_at >= d and q.created_at < d + interval '1 day')) order by d), '[]'::jsonb)
      from generate_series(date_trunc('day', p_from), date_trunc('day', p_to - interval '1 second'), interval '1 day') d
    )
  ) into result;
  return result;
end $$;
revoke execute on function public.admin_kpis(timestamptz, timestamptz) from public, anon;
grant execute on function public.admin_kpis(timestamptz, timestamptz) to authenticated;
