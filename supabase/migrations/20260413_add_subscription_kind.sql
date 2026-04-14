-- Ajoute une colonne "kind" aux récurrences pour distinguer :
--   - 'subscription'   : abonnement (Netflix, Spotify, téléphone...)
--   - 'fixed_expense'  : charge fixe (loyer, assurance, taxe...)
--   - 'income'         : revenu récurrent (salaire, freelance...)
--
-- Les enregistrements existants gardent la valeur par défaut 'subscription'
-- pour préserver la compatibilité. Le type income/expense reste présent et
-- reste la source de vérité pour les calculs (somme, génération de transactions).

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'subscription';

ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_kind_check;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_kind_check
  CHECK (kind IN ('subscription', 'fixed_expense', 'income'));

-- Aligne les revenus existants sur le kind 'income' pour que l'UI
-- les affiche dans la bonne section dès la première ouverture.
UPDATE subscriptions
  SET kind = 'income'
  WHERE type = 'income' AND kind = 'subscription';
