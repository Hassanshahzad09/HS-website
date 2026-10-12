-- The website's forms collect a country name, not an ISO code, so keep it alongside country_code.
alter table public.leads add column country text;
alter table public.quotes add column country text;
