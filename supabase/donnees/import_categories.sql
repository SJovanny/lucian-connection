-- Catégories pour Lucian Connection
-- À exécuter AVANT d'importer les produits

BEGIN;

-- Supprimer les catégories existantes du schéma de démo
DELETE FROM categories WHERE slug IN ('vegetables', 'snacks-breads', 'fruits', 'meat', 'dairy', 'drinks');

-- Insérer les vraies catégories
INSERT INTO categories (slug, display_order, translations) VALUES
  ('assaisonnement', 1, '{"fr": {"name": "Assaisonnement"}, "en": {"name": "Seasonings"}}'),
  ('alimentaire', 2, '{"fr": {"name": "Alimentaire"}, "en": {"name": "Food"}}'),
  ('divers', 3, '{"fr": {"name": "Divers"}, "en": {"name": "Miscellaneous"}}'),
  ('boissons-sans-alcool', 4, '{"fr": {"name": "Boissons sans alcool"}, "en": {"name": "Non-alcoholic beverages"}}'),
  ('boissons-alcoolisees', 5, '{"fr": {"name": "Boissons alcoolisées"}, "en": {"name": "Alcoholic beverages"}}'),
  ('seamoss', 6, '{"fr": {"name": "Sea Moss"}, "en": {"name": "Sea Moss"}}')
ON CONFLICT (slug) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  translations = EXCLUDED.translations;

COMMIT;
