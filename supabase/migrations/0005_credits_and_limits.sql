-- Credits (PRD 1B.4 and section 22): configurable amounts, sign-up grant, and the
-- functions the server uses to spend credits safely.

-- Configurable business decisions. Change the numbers here (or in the table) without a code change.
insert into public.system_settings (key, value) values
  ('credits', '{"signup": 5, "quote_bonus": 10, "guest_previews": 2, "guest_per_ip_per_day": 6, "cost": {"quick": 1, "regenerate": 1, "modify": 1, "angle": 1, "premium": 3}}')
on conflict (key) do nothing;

create or replace function public.credit_setting(variadic path text[]) returns integer
language sql stable security definer set search_path = '' as $$
  select (value #>> path)::integer from public.system_settings where key = 'credits';
$$;

-- One-off grants (sign-up, quote bonus) can only ever be given once per customer.
create unique index credit_ledger_once_per_user on public.credit_ledger (user_id, reason)
  where type = 'grant' and reason in ('signup', 'quote_bonus');

-- Free credits arrive when the email address is confirmed, not at sign-up.
create or replace function public.grant_signup_credits() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is not null and (tg_op = 'INSERT' or old.email_confirmed_at is null) then
    insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
    insert into public.credit_ledger (user_id, type, amount, reason)
    values (new.id, 'grant', coalesce(public.credit_setting('signup'), 5), 'signup')
    on conflict do nothing;
  end if;
  return new;
end $$;
-- Named to run after on_auth_user_created, which creates the profile row.
create trigger on_auth_user_verified after insert or update of email_confirmed_at on auth.users
  for each row execute function public.grant_signup_credits();

-- Customers who confirmed before this was added.
insert into public.credit_ledger (user_id, type, amount, reason)
select u.id, 'grant', coalesce(public.credit_setting('signup'), 5), 'signup'
from auth.users u join public.profiles p on p.id = u.id
where u.email_confirmed_at is not null
on conflict do nothing;

-- Holds credits for a generation. Returns false when the balance is too low.
-- The per-customer lock stops two clicks at the same moment from spending the same credits.
create or replace function public.credit_reserve(p_user uuid, p_amount integer, p_generation uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  available integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));
  select coalesce(sum(amount), 0) into available from public.credit_ledger where user_id = p_user;
  if available < p_amount then
    return false;
  end if;
  insert into public.credit_ledger (user_id, type, amount, generation_id, reason)
  values (p_user, 'reserve', -p_amount, p_generation, 'generation started');
  return true;
end $$;

-- Settles a held generation: charged on success, handed back on failure. Safe to call twice.
create or replace function public.credit_settle(p_generation uuid, p_success boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare
  r record;
begin
  select user_id, -amount as amount into r from public.credit_ledger where generation_id = p_generation and type = 'reserve';
  if not found then
    return;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(r.user_id::text, 0));
  if exists (select 1 from public.credit_ledger where generation_id = p_generation and type = 'release') then
    return;
  end if;
  insert into public.credit_ledger (user_id, type, amount, generation_id, reason)
  values (r.user_id, 'release', r.amount, p_generation, case when p_success then 'generation finished' else 'generation failed' end);
  if p_success then
    insert into public.credit_ledger (user_id, type, amount, generation_id, reason)
    values (r.user_id, 'debit', -r.amount, p_generation, 'generation');
  end if;
end $$;

-- Only the server may call these.
revoke execute on function public.credit_reserve(uuid, integer, uuid) from public, anon, authenticated;
revoke execute on function public.credit_settle(uuid, boolean) from public, anon, authenticated;
revoke execute on function public.grant_signup_credits() from public, anon, authenticated;
revoke execute on function public.credit_setting(text[]) from public, anon, authenticated;
