-- Marquer les produits vedettes (Produits à la une)
-- À exécuter dans le SQL Editor de Supabase

BEGIN;

-- D'abord, réinitialiser tous les produits vedettes
UPDATE products SET is_featured = false;

-- Marquer les produits spécifiques comme vedettes
-- Shirley Biscuits
UPDATE products 
SET is_featured = true 
WHERE translations->>'fr'->>'name' ILIKE '%shirley%' 
   OR translations->>'en'->>'name' ILIKE '%shirley%'
   OR slug ILIKE '%shirley%';

-- Green Seasoning
UPDATE products 
SET is_featured = true 
WHERE translations->>'fr'->>'name' ILIKE '%green seasoning%' 
   OR translations->>'en'->>'name' ILIKE '%green seasoning%'
   OR slug ILIKE '%green-seasoning%';

-- Piton (bière)
UPDATE products 
SET is_featured = true 
WHERE translations->>'fr'->>'name' ILIKE '%piton%' 
   OR translations->>'en'->>'name' ILIKE '%piton%'
   OR slug ILIKE '%piton%';

-- Icy Soda
UPDATE products 
SET is_featured = true 
WHERE translations->>'fr'->>'name' ILIKE '%icy%' 
   OR translations->>'en'->>'name' ILIKE '%icy%'
   OR slug ILIKE '%icy%';

-- Jergens
UPDATE products 
SET is_featured = true 
WHERE translations->>'fr'->>'name' ILIKE '%jergens%' 
   OR translations->>'en'->>'name' ILIKE '%jergens%'
   OR slug ILIKE '%jergens%';

-- Sea Moss
UPDATE products 
SET is_featured = true 
WHERE translations->>'fr'->>'name' ILIKE '%sea moss%' 
   OR translations->>'en'->>'name' ILIKE '%sea moss%'
   OR translations->>'fr'->>'name' ILIKE '%seamoss%' 
   OR translations->>'en'->>'name' ILIKE '%seamoss%'
   OR slug ILIKE '%sea-moss%'
   OR slug ILIKE '%seamoss%';

-- Vérifier les produits marqués comme vedettes
SELECT slug, translations->>'fr'->>'name' as name_fr, is_featured 
FROM products 
WHERE is_featured = true;

COMMIT;
