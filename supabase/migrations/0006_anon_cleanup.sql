-- Removing an expired visitor session removes that visitor's own records with it.
-- (With "set null" the delete was refused, because each of these rows must belong to someone.)
alter table public.generations drop constraint generations_anon_session_id_fkey,
  add constraint generations_anon_session_id_fkey foreign key (anon_session_id) references public.anon_sessions (id) on delete cascade;
alter table public.projects drop constraint projects_anon_session_id_fkey,
  add constraint projects_anon_session_id_fkey foreign key (anon_session_id) references public.anon_sessions (id) on delete cascade;
alter table public.uploaded_assets drop constraint uploaded_assets_anon_session_id_fkey,
  add constraint uploaded_assets_anon_session_id_fkey foreign key (anon_session_id) references public.anon_sessions (id) on delete cascade;
alter table public.credit_ledger drop constraint credit_ledger_anon_session_id_fkey,
  add constraint credit_ledger_anon_session_id_fkey foreign key (anon_session_id) references public.anon_sessions (id) on delete cascade;
