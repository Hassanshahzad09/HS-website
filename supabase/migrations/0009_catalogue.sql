-- Catalogue in the database: the extra product fields the website shows, product photos,
-- and a public storage bucket for them.

alter table public.product_categories add column blurb text;

alter table public.products
  add column moq_text      text,
  add column finish_label  text,
  add column featured      boolean not null default false,
  add column why           text[] not null default '{}',
  add column customization text[] not null default '{}',
  add column applications  text[] not null default '{}',
  add column tags          text[] not null default '{}';

-- Display details of an option that are not prompt text: the swatch tone or the finish effect.
alter table public.attribute_values add column meta jsonb not null default '{}'::jsonb;

create table public.product_images (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products (id) on delete cascade,
  kind            text not null check (kind in ('main', 'gallery', 'variant')),
  storage_bucket  text not null default 'product-images',
  storage_path    text not null,
  url             text not null,
  label           text,
  -- For variant photos: the finish effect and/or colour this photo shows.
  effect          text,
  colour          text,
  sort            integer not null default 0,
  created_at      timestamptz not null default now(),
  unique (product_id, storage_path)
);
create index product_images_product_id_idx on public.product_images (product_id, sort);

alter table public.product_images enable row level security;
grant select on public.product_images to anon;
grant select, insert, update, delete on public.product_images to authenticated;
grant all on public.product_images to service_role;
create policy "public: read product images" on public.product_images for select to anon, authenticated using (true);
create policy "admin: write product images" on public.product_images for all to authenticated
  using (public.has_role('admin', 'super_admin')) with check (public.has_role('admin', 'super_admin'));

-- Product photos are public files; only admins can add, replace or remove them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do nothing;

create policy "admin: add product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role('admin', 'super_admin'));
create policy "admin: replace product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.has_role('admin', 'super_admin'))
  with check (bucket_id = 'product-images' and public.has_role('admin', 'super_admin'));
create policy "admin: remove product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role('admin', 'super_admin'));
create policy "admin: list product images" on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and public.has_role('admin', 'super_admin'));
