-- Ajoute une colonne "icon" (emoji) aux catégories.
-- À exécuter dans le SQL editor Supabase ou via la CLI.
alter table public.categories
  add column if not exists icon text;
