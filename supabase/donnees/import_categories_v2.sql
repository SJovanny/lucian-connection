-- Nouvelles catégories réorganisées pour Lucian Connection
-- Version 2.0 - Réorganisation complète

-- ÉTAPE 1: Mettre à jour les catégories existantes (garder leurs IDs)
UPDATE categories SET 
  translations = '{"fr": {"name": "Épices & Assaisonnements"}, "en": {"name": "Spices & Seasonings"}}'::jsonb,
  display_order = 1
WHERE slug = 'assaisonnement';

UPDATE categories SET 
  translations = '{"fr": {"name": "Boissons Sans Alcool"}, "en": {"name": "Non-Alcoholic Beverages"}}'::jsonb,
  display_order = 11
WHERE slug = 'boissons-sans-alcool';

UPDATE categories SET 
  translations = '{"fr": {"name": "Boissons Alcoolisées"}, "en": {"name": "Alcoholic Beverages"}}'::jsonb,
  display_order = 12
WHERE slug = 'boissons-alcoolisees';

UPDATE categories SET 
  translations = '{"fr": {"name": "Sea Moss"}, "en": {"name": "Sea Moss"}}'::jsonb,
  display_order = 13
WHERE slug = 'seamoss';

-- ÉTAPE 2: Insérer les nouvelles catégories
INSERT INTO categories (slug, translations, display_order) VALUES
-- Catégorie 2: Épicerie sucrée (biscuits, céréales, snacks sucrés)
('epicerie-sucree', 
 '{"fr": {"name": "Épicerie Sucrée"}, "en": {"name": "Sweet Groceries"}}'::jsonb, 2),

-- Catégorie 3: Épicerie salée (chips, crackers, snacks salés)
('epicerie-salee', 
 '{"fr": {"name": "Épicerie Salée"}, "en": {"name": "Savory Groceries"}}'::jsonb, 3),

-- Catégorie 4: Conserves et condiments (sauces, conserves, marinades)
('conserves-condiments', 
 '{"fr": {"name": "Conserves & Condiments"}, "en": {"name": "Canned Goods & Condiments"}}'::jsonb, 4),

-- Catégorie 5: Soins capillaires
('soins-capillaires', 
 '{"fr": {"name": "Soins Capillaires"}, "en": {"name": "Hair Care"}}'::jsonb, 5),

-- Catégorie 6: Hygiène et beauté
('hygiene-beaute', 
 '{"fr": {"name": "Hygiène & Beauté"}, "en": {"name": "Hygiene & Beauty"}}'::jsonb, 6),

-- Catégorie 7: Parfums
('parfums', 
 '{"fr": {"name": "Parfums"}, "en": {"name": "Perfumes"}}'::jsonb, 7),

-- Catégorie 8: Bébé et enfant
('bebe-enfant', 
 '{"fr": {"name": "Bébé & Enfant"}, "en": {"name": "Baby & Child"}}'::jsonb, 8),

-- Catégorie 9: Santé et bien-être
('sante-bien-etre', 
 '{"fr": {"name": "Santé & Bien-être"}, "en": {"name": "Health & Wellness"}}'::jsonb, 9),

-- Catégorie 10: Entretien ménager
('entretien-menager', 
 '{"fr": {"name": "Entretien Ménager"}, "en": {"name": "Household Cleaning"}}'::jsonb, 10)

ON CONFLICT (slug) DO UPDATE SET
  translations = EXCLUDED.translations,
  display_order = EXCLUDED.display_order;
