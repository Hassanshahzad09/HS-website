-- Customer confirmation emails: off until heritageshapes.com is verified in Resend.
update public.system_settings
set value = value || '{"confirm_customers": false, "customer_from": "Heritage Shapes <hello@heritageshapes.com>"}'::jsonb
where key = 'notifications';
