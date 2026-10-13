-- Real AI generation: an on/off switch, the model to use, and what each image costs.

-- AI stays off until it is switched on here (or in admin Settings). While off, the Studio
-- shows sample photos; credits, limits and records work the same either way.
update public.system_settings
set value = '{"ai_enabled": false, "model": "gemini-3.1-flash-image"}'::jsonb || value
where key = 'studio';

-- Price per generated image at standard (1K) size, used to record AI cost on each design.
-- Figures from Google's pricing page; update them here when Google changes its prices.
insert into public.ai_model_prices (provider, model, unit, price_usd, effective_from) values
  ('gemini', 'gemini-3.1-flash-lite-image', 'image', 0.0336, '2026-10-01'),
  ('gemini', 'gemini-3.1-flash-image',      'image', 0.067,  '2026-10-01'),
  ('gemini', 'gemini-3-pro-image',          'image', 0.134,  '2026-10-01'),
  ('gemini', 'gemini-2.5-flash-image',      'image', 0.039,  '2026-10-01')
on conflict do nothing;
