-- Where new-lead emails go, and who they appear to come from.
-- While the domain is not verified in Resend, "from" must stay onboarding@resend.dev and
-- lead_email must be the address the Resend account was created with.
insert into public.system_settings (key, value) values
  ('notifications', '{"lead_email": "heritageshapes@gmail.com", "from": "Heritage Shapes Website <onboarding@resend.dev>"}')
on conflict (key) do nothing;
