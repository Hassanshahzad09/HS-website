-- Admins record their own changes (role changes, settings) in the audit log. Entries cannot be edited or removed.
create policy "admin: write audit log" on public.audit_log for insert to authenticated
  with check (public.has_role('admin', 'super_admin') and actor_id = (select auth.uid()));
