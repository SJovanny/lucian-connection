-- ============================================
-- Script de diagnostic et nettoyage des catégories vides
-- ============================================

-- 1. DIAGNOSTIC : Voir toutes les catégories avec le nombre de produits
SELECT 
  c.slug,
  c.translations->>'fr'->>'name' as nom_fr,
  c.display_order,
  COUNT(p.id) as nb_produits
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
GROUP BY c.id, c.slug, c.translations, c.display_order
ORDER BY c.display_order;

-- 2. VOIR uniquement les catégories VIDES (0 produits)
SELECT 
  c.id,
  c.slug,
  c.translations->'fr'->>'name' as nom_fr
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
GROUP BY c.id, c.slug, c.translations
HAVING COUNT(p.id) = 0;

-- 3. OPTION A : Supprimer les catégories vides (ATTENTION - irréversible!)
-- Décommentez pour exécuter
/*
DELETE FROM categories
WHERE id IN (
  SELECT c.id
  FROM categories c
  LEFT JOIN products p ON p.category_id = c.id
  GROUP BY c.id
  HAVING COUNT(p.id) = 0
);
*/

-- 4. OPTION B : Ajouter un champ is_active aux catégories pour les masquer
-- (Plus sûr que de supprimer)
/*
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

UPDATE categories SET is_active = false
WHERE id IN (
  SELECT c.id
  FROM categories c
  LEFT JOIN products p ON p.category_id = c.id
  GROUP BY c.id
  HAVING COUNT(p.id) = 0
);
*/
