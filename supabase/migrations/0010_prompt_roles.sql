-- How a finish option is used when the AI prompt is built:
--   surface = the finish of the whole item (matte, gloss…)
--   logo    = how the logo is applied (foil, emboss, print…)
--   shape   = the cut of the item (die cut)
alter table public.attribute_values add column prompt_role text check (prompt_role in ('surface', 'logo', 'shape'));
