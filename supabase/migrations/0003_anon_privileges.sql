-- Visitors who are not signed in get read access to the public catalogue and content only.
-- Supabase grants anon full table privileges by default; row level security already hid the rows,
-- this removes the privilege as well so private tables are closed twice over.
revoke all on all tables in schema public from anon;
grant select on public.product_categories, public.products, public.attributes, public.attribute_values,
  public.product_attributes, public.product_attribute_values, public.config_rules, public.plans,
  public.blog_posts, public.seo_pages, public.generation_outputs to anon;

-- Tables added later start closed to visitors too.
alter default privileges in schema public revoke all on tables from anon;
