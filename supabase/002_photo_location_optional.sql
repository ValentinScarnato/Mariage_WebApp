-- Permet une photo "mise en avant" sans lieu associé (ex: la demande en mariage)
-- A exécuter une seule fois dans Supabase Dashboard > SQL Editor > New query > Run

alter table photos alter column location_id drop not null;
