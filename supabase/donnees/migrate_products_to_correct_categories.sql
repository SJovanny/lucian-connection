-- ============================================
-- Migration des produits vers les bonnes catégories
-- Script de correction automatique basé sur les noms de produits
-- ============================================

BEGIN;

-- ============================================
-- 1. SOINS CAPILLAIRES (anciennement dans 'divers')
-- Mots-clés: shampoo, conditioner, hair, gel, mousse, relaxer, oil (capillaire)
-- ============================================

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'soins-capillaires')
WHERE (
  LOWER(translations->'fr'->>'name') SIMILAR TO '%(shampoo|shampo|conditioner|hair|cheveux|gel|mousse|relaxer|braid|dreads|lottabody|eco gel|eco styler|african pride|blue magic|dax|cream of nature|creme of nature|botanicals|ors|avanti silicon|baba de caracol|capilo|black castor oil|miss key)%'
  OR LOWER(slug) SIMILAR TO '%(shampoo|conditioner|hair|gel-|mousse|relaxer|braid|dreads|lottabody|eco-gel|eco-styler|african-pride|blue-magic|dax|cream-of-nature|botanicals|ors-|avanti-silicon|baba-de-caracol|capilo|black-castor|miss-key)%'
)
AND category_id = (SELECT id FROM categories WHERE slug = 'divers');

-- ============================================
-- 2. HYGIENE & BEAUTÉ (anciennement dans 'divers')
-- Mots-clés: soap, body wash, lotion, cream (corps), deodorant, roll on, toothpaste, mouthwash
-- ============================================

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'hygiene-beaute')
WHERE (
  LOWER(translations->'fr'->>'name') SIMILAR TO '%(soap|savon|body wash|bodywash|lotion|deodorant|roll on|toothpaste|mouthwash|colgate|dove|irish spring|carbolic|bubblers|jergens|dermasil|shower|bath)%'
  OR LOWER(slug) SIMILAR TO '%(soap|body-wash|bodywash|lotion|deodorant|roll-on|toothpaste|mouthwash|colgate|dove|irish-spring|carbolic|bubblers|jergens|dermasil)%'
)
AND category_id = (SELECT id FROM categories WHERE slug = 'divers');

-- ============================================
-- 3. PARFUMS (anciennement dans 'divers')
-- Mots-clés: parfum, perfume, cologne, body spray, body mist, armaf, cabotine, guess, charlie
-- ============================================

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'parfums')
WHERE (
  LOWER(translations->'fr'->>'name') SIMILAR TO '%(parfum|perfume|cologne|body spray|body mist|armaf|cabotine|guess|charlie|brillant|double diamond|double hearts|dis-lui|new brand|bod men|body fantasies|bay rum)%'
  OR LOWER(slug) SIMILAR TO '%(parfum|perfume|cologne|body-spray|body-mist|armaf|cabotine|guess|charlie|brillant|double-diamond|double-hearts|dis-lui|new-brand|bod-men|body-fantasies|bay-rum)%'
)
AND category_id = (SELECT id FROM categories WHERE slug = 'divers');

-- ============================================
-- 4. BÉBÉ & ENFANT (anciennement dans 'divers')
-- Mots-clés: baby, bébé, johnson, infacol, powder (bébé)
-- ============================================

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'bebe-enfant')
WHERE (
  LOWER(translations->'fr'->>'name') SIMILAR TO '%(baby|bébé|johnson|infacol|ammens powder)%'
  OR LOWER(slug) SIMILAR TO '%(baby|johnson|infacol|ammens)%'
)
AND category_id = (SELECT id FROM categories WHERE slug = 'divers');

-- ============================================
-- 5. SANTÉ & BIEN-ÊTRE (anciennement dans 'divers')
-- Mots-clés: vitamin, analgesic, ferrol, alcolado, citrocol, menthol, mustarcream
-- ============================================

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sante-bien-etre')
WHERE (
  LOWER(translations->'fr'->>'name') SIMILAR TO '%(vitamin|analgesic|ferrol|alcolado|citrocol|menthol|mustarcream|ice cold|bokini balm)%'
  OR LOWER(slug) SIMILAR TO '%(vitamin|analgesic|ferrol|alcolado|citrocol|menthol|mustarcream|ice-cold|bokini)%'
)
AND category_id = (SELECT id FROM categories WHERE slug = 'divers');

-- ============================================
-- 6. ENTRETIEN MÉNAGER (anciennement dans 'divers')
-- Mots-clés: cleaner, lessive, vaisselle, fabric softener, lysol, fabuloso, ajax, alba
-- ============================================

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'entretien-menager')
WHERE (
  LOWER(translations->'fr'->>'name') SIMILAR TO '%(cleaner|lessive|vaisselle|fabric softener|lysol|fabuloso|ajax|alba|downy|jaze fluid)%'
  OR LOWER(slug) SIMILAR TO '%(cleaner|lessive|vaisselle|fabric-softener|lysol|fabuloso|ajax|alba|downy|jaze)%'
)
AND category_id = (SELECT id FROM categories WHERE slug = 'divers');

-- ============================================
-- 7. ÉPICERIE SUCRÉE (anciennement dans 'alimentaire')
-- Mots-clés: cookie, biscuit, cereal, cake, chocolate, candy, sweet, sugar, jam, syrup, honey
-- ============================================

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'epicerie-sucree')
WHERE (
  LOWER(translations->'fr'->>'name') SIMILAR TO '%(cookie|biscuit|cereal|cake|chocolate|candy|sweet|jam|syrup|honey|oreo|cheerios|lucky charms|froot loops|cream of wheat|custard|browning|melli melow|goodie|dixee|breaktime|crix|nibbles|kiss cake|butter cookies|bourbon|domino cream)%'
  OR LOWER(slug) SIMILAR TO '%(cookie|biscuit|cereal|cake|chocolate|candy|sweet|jam|syrup|honey|oreo|cheerios|lucky-charms|froot-loops|cream-of-wheat|custard|browning|melli|goodie|dixee|breaktime|crix|nibbles|kiss-cake|butter-cookies|bourbon|domino)%'
)
AND category_id = (SELECT id FROM categories WHERE slug = 'alimentaire');

-- ============================================
-- 8. ÉPICERIE SALÉE (anciennement dans 'alimentaire')
-- Mots-clés: chips, crackers, snacks, peanuts, corn, combos, cheese puffs, lava bits
-- ============================================

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'epicerie-salee')
WHERE (
  LOWER(translations->'fr'->>'name') SIMILAR TO '%(chips|cracker|snack|peanut|corn combo|combos|cheese puff|lava bits|chow men|noodle|macaroni|mac & cheese|oats|rice)%'
  OR LOWER(slug) SIMILAR TO '%(chips|cracker|snack|peanut|corn-combo|combos|cheese-puff|lava-bits|chow-men|noodle|macaroni|mac-cheese|oats|rice)%'
)
AND category_id = (SELECT id FROM categories WHERE slug = 'alimentaire');

-- ============================================
-- 9. CONSERVES & CONDIMENTS (anciennement dans 'alimentaire')
-- Mots-clés: sauce, ketchup, mustard, mayonnaise, relish, beans, peas, luncheon, milk (conserve), coconut
-- ============================================

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'conserves-condiments')
WHERE (
  LOWER(translations->'fr'->>'name') SIMILAR TO '%(sauce|ketchup|mustard|mayonnaise|mayo|relish|baked beans|black eye peas|peas|luncheon|evaporated milk|coconut oil|creamed coconut|coffee mate|clove|pepper|dressing|heinz|hellman|baron|chilli|garlic)%'
  OR LOWER(slug) SIMILAR TO '%(sauce|ketchup|mustard|mayonnaise|mayo|relish|baked-beans|black-eye-peas|luncheon|evaporated|coconut|coffee-mate|clove|pepper|dressing|heinz|hellman|baron|chilli|garlic)%'
)
AND category_id = (SELECT id FROM categories WHERE slug = 'alimentaire');

-- ============================================
-- 10. Migrer les produits restants de 'alimentaire' et 'divers' vers épicerie sucrée/salée par défaut
-- ============================================

-- Produits alimentaires restants -> épicerie salée (défaut pour alimentaire non classé)
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'epicerie-salee')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'alimentaire');

-- Produits divers restants -> hygiène beauté (défaut pour divers non classé)
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'hygiene-beaute')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'divers');

-- ============================================
-- 11. Supprimer les anciennes catégories vides
-- ============================================

DELETE FROM categories WHERE slug IN ('alimentaire', 'divers')
AND NOT EXISTS (SELECT 1 FROM products WHERE products.category_id = categories.id);

COMMIT;

-- ============================================
-- VÉRIFICATION : Compter les produits par catégorie
-- ============================================

SELECT 
  c.slug,
  c.translations->'fr'->>'name' as nom_fr,
  COUNT(p.id) as nb_produits
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
GROUP BY c.id, c.slug, c.translations
ORDER BY c.display_order;
