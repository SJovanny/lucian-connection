-- Enrichir les produits: tailles, descriptions et allergènes
BEGIN;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS allergens JSONB NOT NULL DEFAULT '{"fr": [], "en": []}';

-- Déduire l'unité depuis le nom du produit (ex: 500 ml, 1.5 L, 33cl)
WITH name_source AS (
  SELECT
    id,
    COALESCE(translations->'fr'->>'name', translations->'en'->>'name', '') AS name_text
  FROM products
)
UPDATE products
SET unit = upper(replace(substring(name_text from '(\d+(?:[\.,]\d+)?)\s*(ml|l|cl|g|kg)'), ',', '.'))
FROM name_source
WHERE products.id = name_source.id
  AND (unit IS NULL OR unit = '' OR unit = 'each')
  AND name_text ~* '(\d+(?:[\.,]\d+)?)\s*(ml|l|cl|g|kg)';

-- Générer une description simple si manquante
UPDATE products
SET translations = jsonb_set(
  jsonb_set(
    translations,
    '{fr,description}',
    to_jsonb(
      CASE
        WHEN COALESCE(translations->'fr'->>'description', '') <> '' THEN translations->'fr'->>'description'
        ELSE
          concat_ws(' ', 'Produit', COALESCE(translations->'fr'->>'name', translations->'en'->>'name', slug))
          || CASE
            WHEN unit IS NOT NULL AND unit <> '' AND unit <> 'each' THEN ' (' || unit || ')'
            ELSE ''
          END
      END
    ),
    true
  ),
  '{en,description}',
  to_jsonb(
    CASE
      WHEN COALESCE(translations->'en'->>'description', '') <> '' THEN translations->'en'->>'description'
      ELSE
        concat_ws(' ', 'Product', COALESCE(translations->'en'->>'name', translations->'fr'->>'name', slug))
        || CASE
          WHEN unit IS NOT NULL AND unit <> '' AND unit <> 'each' THEN ' (' || unit || ')'
          ELSE ''
        END
    END
  ),
  true
)
WHERE COALESCE(translations->'fr'->>'description', '') = ''
   OR COALESCE(translations->'en'->>'description', '') = '';

-- Déduire les allergènes depuis le nom du produit (heuristiques)
WITH extracted AS (
  SELECT
    id,
    lower(COALESCE(translations->'fr'->>'name', translations->'en'->>'name', '')) AS name_text
  FROM products
)
UPDATE products
SET allergens = jsonb_build_object(
  'fr', to_jsonb(array_remove(ARRAY[
    CASE WHEN name_text ~ '(arachide|peanut)' THEN 'arachide' END,
    CASE WHEN name_text ~ '(lait|milk)' THEN 'lait' END,
    CASE WHEN name_text ~ '(soja|soy)' THEN 'soja' END,
    CASE WHEN name_text ~ '(noix|nuts|nut)' THEN 'noix' END,
    CASE WHEN name_text ~ '(sésame|sesame|sesam)' THEN 'sésame' END,
    CASE WHEN name_text ~ '(bl[eé]|wheat|gluten|c[eé]r[eé]ales)' THEN 'gluten' END,
    CASE WHEN name_text ~ '(oeuf|egg)' THEN 'oeuf' END,
    CASE WHEN name_text ~ '(poisson|fish|saumon|thon)' THEN 'poisson' END,
    CASE WHEN name_text ~ '(crevette|shrimp|crustac)' THEN 'crustacés' END,
    CASE WHEN name_text ~ '(moutarde|mustard)' THEN 'moutarde' END,
    CASE WHEN name_text ~ '(céleri|celery)' THEN 'céleri' END,
    CASE WHEN name_text ~ '(lupin)' THEN 'lupin' END,
    CASE WHEN name_text ~ '(sulfite|sulfit)' THEN 'sulfites' END
  ], NULL)),
  'en', to_jsonb(array_remove(ARRAY[
    CASE WHEN name_text ~ '(arachide|peanut)' THEN 'peanuts' END,
    CASE WHEN name_text ~ '(lait|milk)' THEN 'milk' END,
    CASE WHEN name_text ~ '(soja|soy)' THEN 'soy' END,
    CASE WHEN name_text ~ '(noix|nuts|nut)' THEN 'nuts' END,
    CASE WHEN name_text ~ '(sésame|sesame|sesam)' THEN 'sesame' END,
    CASE WHEN name_text ~ '(bl[eé]|wheat|gluten|c[eé]r[eé]ales)' THEN 'gluten' END,
    CASE WHEN name_text ~ '(oeuf|egg)' THEN 'eggs' END,
    CASE WHEN name_text ~ '(poisson|fish|saumon|thon)' THEN 'fish' END,
    CASE WHEN name_text ~ '(crevette|shrimp|crustac)' THEN 'crustaceans' END,
    CASE WHEN name_text ~ '(moutarde|mustard)' THEN 'mustard' END,
    CASE WHEN name_text ~ '(céleri|celery)' THEN 'celery' END,
    CASE WHEN name_text ~ '(lupin)' THEN 'lupin' END,
    CASE WHEN name_text ~ '(sulfite|sulfit)' THEN 'sulfites' END
  ], NULL))
)
FROM extracted
WHERE products.id = extracted.id
  AND (products.allergens IS NULL OR products.allergens = '{"fr": [], "en": []}'::jsonb);

COMMIT;
