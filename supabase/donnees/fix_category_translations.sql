-- Script pour vérifier et corriger les traductions des catégories
-- Exécutez d'abord cette requête pour voir l'état actuel:

SELECT slug, translations FROM categories ORDER BY display_order;

-- Si les traductions sont inversées ou incorrectes, exécutez ces UPDATE:

-- Épices & Assaisonnements
UPDATE categories SET 
  translations = '{"fr": {"name": "Épices & Assaisonnements"}, "en": {"name": "Spices & Seasonings"}}'::jsonb
WHERE slug = 'assaisonnement';

-- Épicerie Sucrée
UPDATE categories SET 
  translations = '{"fr": {"name": "Épicerie Sucrée"}, "en": {"name": "Sweet Groceries"}}'::jsonb
WHERE slug = 'epicerie-sucree';

-- Épicerie Salée
UPDATE categories SET 
  translations = '{"fr": {"name": "Épicerie Salée"}, "en": {"name": "Savory Groceries"}}'::jsonb
WHERE slug = 'epicerie-salee';

-- Conserves & Condiments
UPDATE categories SET 
  translations = '{"fr": {"name": "Conserves & Condiments"}, "en": {"name": "Canned Goods & Condiments"}}'::jsonb
WHERE slug = 'conserves-condiments';

-- Soins Capillaires
UPDATE categories SET 
  translations = '{"fr": {"name": "Soins Capillaires"}, "en": {"name": "Hair Care"}}'::jsonb
WHERE slug = 'soins-capillaires';

-- Hygiène & Beauté
UPDATE categories SET 
  translations = '{"fr": {"name": "Hygiène & Beauté"}, "en": {"name": "Hygiene & Beauty"}}'::jsonb
WHERE slug = 'hygiene-beaute';

-- Parfums
UPDATE categories SET 
  translations = '{"fr": {"name": "Parfums"}, "en": {"name": "Perfumes"}}'::jsonb
WHERE slug = 'parfums';

-- Bébé & Enfant
UPDATE categories SET 
  translations = '{"fr": {"name": "Bébé & Enfant"}, "en": {"name": "Baby & Child"}}'::jsonb
WHERE slug = 'bebe-enfant';

-- Santé & Bien-être
UPDATE categories SET 
  translations = '{"fr": {"name": "Santé & Bien-être"}, "en": {"name": "Health & Wellness"}}'::jsonb
WHERE slug = 'sante-bien-etre';

-- Entretien Ménager
UPDATE categories SET 
  translations = '{"fr": {"name": "Entretien Ménager"}, "en": {"name": "Household Cleaning"}}'::jsonb
WHERE slug = 'entretien-menager';

-- Boissons Sans Alcool
UPDATE categories SET 
  translations = '{"fr": {"name": "Boissons Sans Alcool"}, "en": {"name": "Non-Alcoholic Beverages"}}'::jsonb
WHERE slug = 'boissons-sans-alcool';

-- Boissons Alcoolisées
UPDATE categories SET 
  translations = '{"fr": {"name": "Boissons Alcoolisées"}, "en": {"name": "Alcoholic Beverages"}}'::jsonb
WHERE slug = 'boissons-alcoolisees';

-- Sea Moss
UPDATE categories SET 
  translations = '{"fr": {"name": "Sea Moss"}, "en": {"name": "Sea Moss"}}'::jsonb
WHERE slug = 'seamoss';

-- Vérification après correction:
SELECT slug, translations FROM categories ORDER BY display_order;
