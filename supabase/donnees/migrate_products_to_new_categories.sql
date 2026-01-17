-- Migration des produits vers les nouvelles catégories
-- À exécuter APRÈS import_categories_v2.sql

-- ============================================
-- SOINS CAPILLAIRES (depuis divers et alimentaire)
-- ============================================
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'soins-capillaires')
WHERE slug IN (
  -- African Pride
  'african-pride-shea-butter-miracle-leave-in-conditioner-15oz',
  'african-pride-shea-miracle-moisture-intense-bouncy-curls-pudding-15oz',
  'african-pride-olive-miracle-growth-oil-8oz',
  'african-pride-olive-miracle-anti-breakage-formula-6oz',
  'african-pride-olive-miracle-magical-gro-rejuvenating-6oz',
  'african-pride-olive-miracle-leave-in-conditioner-12oz',
  'african-pride-olive-miracle-2in1-shampoo-conditioner-12oz',
  'african-pride-moisture-miracle-coconut-oil-baobab-oil-leave-in-cream-15oz',
  'african-pride-moisture-miracle-honey-coconut-oil-conditioner-12oz',
  'african-pride-moisture-miracle-honey-coconut-oil-shampoo-12oz',
  'african-pride-dream-kids-olive-miracle-detangling-moisturizing-conditioner-12oz',
  'african-pride-dream-kids-olive-miracle-shampoo-12oz',
  -- Eco Styler
  'eco-styler-olive-oil-gel-12oz',
  'eco-styler-argan-oil-gel-12oz',
  'eco-styler-black-castor-flaxseed-oil-gel-12oz',
  'eco-styler-curl-wave-gel-16oz',
  'eco-styler-krystal-gel-12oz',
  'eco-styler-olive-oil-gel-16oz',
  'eco-styler-olive-oil-gel-32oz',
  -- ORS
  'ors-olive-oil-replenishing-conditioner-125oz',
  'ors-olive-oil-girls-gentle-cleanse-shampoo-13oz',
  'ors-olive-oil-incredible-rich-moisturizing-hair-lotion-85oz',
  'ors-olive-oil-nourishing-sheen-spray-117oz',
  'ors-olive-oil-smooth-control-styling-gelee-85oz',
  'ors-olive-oil-edge-control-225oz',
  'ors-hair-mayonnaise-treatment-16oz',
  'ors-coconut-oil-conditioning-creme-125oz',
  'ors-curls-unleashed-curl-boosting-jelly-16oz',
  'ors-monoi-oil-anti-breakage-edge-control-225oz',
  -- Palmers
  'palmers-olive-oil-formula-gro-therapy-85oz',
  'palmers-coconut-oil-formula-leave-in-conditioner-250ml',
  'palmers-coconut-oil-formula-shine-serum-hair-polisher-178ml',
  'palmers-cocoa-butter-formula-concentrated-cream-60g',
  -- Blue Magic
  'blue-magic-super-sure-gro-12oz',
  'blue-magic-coconut-oil-hair-conditioner-12oz',
  'blue-magic-olive-oil-hair-conditioner-12oz',
  'blue-magic-castor-oil-hair-skin-conditioner-12oz',
  'blue-magic-hair-food-enriched-12oz',
  -- Dax
  'dax-super-gro-hair-scalp-conditioner-7oz',
  'dax-pressing-oil-7oz',
  'dax-pomade-wax-35oz',
  -- Murrays
  'murrays-beeswax-35oz',
  'murrays-hair-glo-pomade-3oz',
  'murrays-superior-hair-dressing-pomade-3oz',
  -- Sulfur 8
  'sulfur-8-original-hair-scalp-conditioner-4oz',
  'sulfur-8-medicated-light-formula-hair-scalp-conditioner-4oz',
  'sulfur-8-kids-medicated-hair-scalp-conditioner-4oz',
  -- Cantu
  'cantu-shea-butter-leave-in-conditioning-repair-cream-16oz',
  'cantu-shea-butter-coconut-curling-cream-12oz',
  'cantu-shea-butter-twist-lock-gel-13oz',
  'cantu-shea-butter-moisturizing-curl-activator-cream-12oz',
  'cantu-shea-butter-daily-oil-moisturizer-13oz',
  'cantu-shea-butter-grow-strong-strengthening-treatment-6oz',
  'cantu-kids-nourishing-shampoo-8oz',
  'cantu-kids-nourishing-conditioner-8oz',
  -- Lottabody
  'lottabody-setting-lotion-concentrated-formula-professional-16oz',
  'lottabody-curl-style-milk-8oz',
  'lottabody-edge-gel-225oz',
  -- Jamaican Mango Lime
  'jamaican-mango-lime-black-castor-oil-4oz',
  'jamaican-mango-lime-island-oil-8oz',
  'jamaican-mango-lime-locking-firm-wax-6oz',
  'jamaican-mango-lime-protein-conditioner-8oz',
  'jamaican-mango-lime-tingle-shampoo-8oz',
  -- IC Fantasia
  'ic-fantasia-hair-polisher-heat-protector-straightening-serum-6oz',
  'ic-fantasia-gel-styling-16oz',
  -- Lets Jam
  'lets-jam-shining-conditioning-gel-regular-hold-55oz',
  'lets-jam-shining-conditioning-gel-extra-hold-55oz',
  -- Vitale
  'vitale-olive-oil-anti-breakage-hair-mayonnaise-30oz',
  -- Relaxers
  'dark-lovely-relaxer-regular-1app',
  'dark-lovely-relaxer-super-1app',
  'optimum-care-relaxer-regular-1app',
  'optimum-care-relaxer-super-1app',
  'pcj-relaxer-regular-1app',
  'pcj-relaxer-super-1app',
  'tcb-naturals-no-lye-relaxer-regular-1app',
  'tcb-naturals-no-lye-relaxer-super-1app',
  -- Autres soins capillaires
  'dark-lovely-au-naturale-moisture-loc-loc-oil-4oz',
  'dark-lovely-beautiful-beginnings-scalp-care-shampoo-8oz',
  'home-health-castor-oil-8oz',
  'now-solutions-jojoba-oil-4oz',
  'queen-helene-cocoa-butter-hand-body-lotion-32oz',
  'soft-sheen-carson-sta-sof-fro-hair-scalp-spray-8oz',
  'softsheen-carson-wave-nouveau-coiffure-finishing-lotion-169oz',
  'wavebuilder-wave-training-lotion-7oz',
  'wild-growth-hair-oil-4oz',
  'wild-growth-light-oil-moisturizer-4oz',
  'worlds-of-curls-activator-gel-32oz'
);

-- ============================================
-- PARFUMS (depuis divers)
-- ============================================
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'parfums')
WHERE slug IN (
  'guess-seductive-homme-blue-edt-100ml',
  'guess-seductive-homme-edt-100ml',
  'guess-seductive-femme-edt-75ml',
  'guess-girl-edt-100ml',
  'guess-1981-homme-edt-100ml',
  'guess-1981-femme-edt-100ml',
  'guess-dare-femme-edt-100ml',
  'cabotine-rose-edt-100ml',
  'cabotine-gold-edt-100ml',
  'cabotine-edt-100ml',
  'armaf-club-de-nuit-intense-man-edp-105ml',
  'armaf-club-de-nuit-intense-woman-edp-105ml',
  'armaf-milestone-edp-100ml',
  'armaf-tres-nuit-edt-100ml',
  'lattafa-asad-edp-100ml',
  'lattafa-raghba-edp-100ml',
  'lattafa-yara-edp-100ml',
  'maison-alhambra-jean-lowe-ombre-edp-100ml',
  'maison-alhambra-lovely-cherie-edp-80ml',
  'afnan-9pm-edp-100ml',
  'afnan-supremacy-gold-edp-100ml',
  'paris-corner-emir-edp-100ml'
);

-- ============================================
-- ENTRETIEN MÉNAGER (depuis divers)
-- ============================================
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'entretien-menager')
WHERE slug IN (
  'ajax-all-purpose-cleaner-lemon-28oz',
  'ajax-dish-liquid-orange-28oz',
  'fabuloso-all-purpose-cleaner-lavender-169oz',
  'fabuloso-all-purpose-cleaner-ocean-paradise-169oz',
  'fabuloso-all-purpose-cleaner-passion-of-fruits-169oz',
  'lysol-disinfectant-spray-crisp-linen-19oz',
  'lysol-disinfectant-spray-early-morning-breeze-19oz',
  'lysol-toilet-bowl-cleaner-24oz',
  'pine-sol-original-cleaner-24oz',
  'pine-sol-lavender-clean-28oz',
  'mr-clean-magic-eraser-original-4ct',
  'mr-clean-multi-surface-cleaner-gain-original-28oz',
  'clorox-bleach-regular-43oz',
  'clorox-clean-up-cleaner-bleach-32oz',
  'comet-powder-cleanser-21oz',
  'spic-span-multi-surface-spray-cleaner-22oz',
  'windex-original-glass-cleaner-23oz',
  'scrubbing-bubbles-bathroom-grime-fighter-25oz',
  'glad-tall-kitchen-drawstring-bags-13gal-45ct',
  'glad-forceflex-tall-kitchen-drawstring-bags-13gal-40ct',
  'hefty-ultra-strong-tall-kitchen-drawstring-bags-13gal-40ct',
  'bounty-paper-towels-select-a-size-2rolls',
  'bounty-paper-towels-essentials-6rolls',
  'scott-paper-towels-choose-a-sheet-6rolls',
  'charmin-ultra-soft-toilet-paper-12mega',
  'charmin-ultra-strong-toilet-paper-12mega',
  'angel-soft-toilet-paper-12double',
  'tide-liquid-laundry-detergent-original-32loads',
  'tide-pods-laundry-detergent-pacs-spring-meadow-42ct',
  'gain-liquid-laundry-detergent-original-32loads',
  'downy-fabric-softener-april-fresh-51oz',
  'snuggle-fabric-softener-blue-sparkle-64oz'
);

-- ============================================
-- BÉBÉ ET ENFANT (depuis divers)
-- ============================================
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'bebe-enfant')
WHERE slug IN (
  'johnsons-baby-powder-15oz',
  'johnsons-baby-oil-14oz',
  'johnsons-baby-shampoo-15oz',
  'johnsons-baby-lotion-15oz',
  'johnsons-baby-wash-gel-15oz',
  'johnsons-bedtime-baby-bath-15oz',
  'johnsons-bedtime-baby-lotion-15oz',
  'pampers-swaddlers-diapers-size-1-32ct',
  'pampers-swaddlers-diapers-size-2-29ct',
  'pampers-swaddlers-diapers-size-3-26ct',
  'pampers-baby-dry-diapers-size-1-32ct',
  'pampers-baby-dry-diapers-size-2-29ct',
  'huggies-little-snugglers-diapers-size-1-32ct',
  'huggies-little-movers-diapers-size-3-25ct',
  'luvs-ultra-leakguards-diapers-size-1-48ct',
  'luvs-ultra-leakguards-diapers-size-2-40ct',
  'pampers-sensitive-wipes-56ct',
  'huggies-natural-care-wipes-56ct',
  'baby-magic-gentle-baby-lotion-9oz',
  'baby-magic-calming-baby-bath-9oz',
  'gerber-good-start-gentle-infant-formula-127oz',
  'similac-pro-advance-infant-formula-125oz',
  'enfamil-neuropro-infant-formula-125oz',
  'gerber-rice-cereal-single-grain-8oz',
  'gerber-oatmeal-cereal-single-grain-8oz',
  'gerber-baby-food-banana-4oz',
  'gerber-baby-food-applesauce-4oz',
  'gerber-baby-food-carrots-4oz',
  'gerber-baby-food-peas-4oz',
  'gerber-baby-food-sweet-potato-4oz',
  'gerber-puffs-cereal-snack-banana-147oz',
  'gerber-puffs-cereal-snack-strawberry-apple-147oz'
);

-- ============================================
-- SANTÉ ET BIEN-ÊTRE (depuis divers)
-- ============================================
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sante-bien-etre')
WHERE slug IN (
  'advil-ibuprofen-200mg-100ct',
  'aleve-naproxen-sodium-220mg-100ct',
  'aspirin-bayer-325mg-100ct',
  'excedrin-extra-strength-100ct',
  'tylenol-extra-strength-500mg-100ct',
  'tums-antacid-assorted-fruit-150ct',
  'pepto-bismol-original-liquid-8oz',
  'pepto-bismol-chewable-tablets-30ct',
  'imodium-ad-anti-diarrheal-12ct',
  'mucinex-dm-extended-release-20ct',
  'robitussin-dm-max-8oz',
  'nyquil-cold-flu-liquid-12oz',
  'dayquil-cold-flu-liquid-12oz',
  'vicks-vaporub-cough-suppressant-175oz',
  'halls-cough-drops-menthol-30ct',
  'ricola-cough-drops-original-herb-21ct',
  'cepacol-sore-throat-lozenges-16ct',
  'benadryl-allergy-ultratabs-100ct',
  'claritin-24hr-allergy-tablets-30ct',
  'zyrtec-24hr-allergy-tablets-30ct',
  'flonase-allergy-relief-nasal-spray-120sprays',
  'visine-original-redness-reliever-05oz',
  'band-aid-flexible-fabric-100ct',
  'neosporin-original-antibiotic-ointment-1oz',
  'hydrocortisone-anti-itch-cream-1oz',
  'bactine-first-aid-antiseptic-5oz',
  'vaseline-petroleum-jelly-13oz',
  'centrum-adult-multivitamin-200ct',
  'one-a-day-womens-multivitamin-100ct',
  'one-a-day-mens-multivitamin-100ct',
  'nature-made-vitamin-d3-1000iu-100ct',
  'nature-made-vitamin-c-500mg-100ct',
  'nature-made-fish-oil-1200mg-100ct'
);

-- ============================================
-- HYGIÈNE ET BEAUTÉ (depuis divers)
-- ============================================
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'hygiene-beaute')
WHERE slug IN (
  'dove-beauty-bar-original-4pk',
  'dove-body-wash-deep-moisture-22oz',
  'dove-deodorant-original-clean-26oz',
  'irish-spring-bar-soap-original-8pk',
  'irish-spring-body-wash-original-clean-18oz',
  'dial-bar-soap-gold-antibacterial-8pk',
  'dial-body-wash-spring-water-21oz',
  'olay-body-wash-fresh-outlast-22oz',
  'caress-body-wash-daily-silk-18oz',
  'softsoap-body-wash-coconut-scrub-20oz',
  'nivea-body-lotion-essentially-enriched-169oz',
  'vaseline-intensive-care-lotion-advanced-repair-20oz',
  'lubriderm-daily-moisture-lotion-24oz',
  'jergens-original-scent-dry-skin-moisturizer-21oz',
  'palmolive-dish-liquid-original-28oz',
  'colgate-total-toothpaste-whitening-48oz',
  'colgate-optic-white-advanced-toothpaste-32oz',
  'crest-3d-white-toothpaste-radiant-mint-48oz',
  'sensodyne-pronamel-toothpaste-4oz',
  'oral-b-toothbrush-indicator-soft-2ct',
  'colgate-360-toothbrush-soft-2ct',
  'listerine-mouthwash-cool-mint-1l',
  'scope-mouthwash-classic-mint-1l',
  'crest-pro-health-mouthwash-mint-1l',
  'gillette-sensor3-disposable-razors-4ct',
  'bic-sensitive-skin-disposable-razors-12ct',
  'schick-hydro-5-refill-cartridges-4ct',
  'edge-shave-gel-sensitive-skin-7oz',
  'barbasol-shaving-cream-original-10oz',
  'secret-deodorant-invisible-solid-powder-fresh-26oz',
  'degree-deodorant-men-cool-rush-27oz',
  'speed-stick-deodorant-ocean-surf-3oz',
  'old-spice-deodorant-high-endurance-pure-sport-3oz',
  'right-guard-deodorant-sport-fresh-26oz',
  'axe-body-spray-phoenix-4oz',
  'q-tips-cotton-swabs-500ct',
  'cotton-balls-triple-size-100ct'
);

-- ============================================
-- ÉPICERIE SUCRÉE (depuis alimentaire)
-- ============================================
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'epicerie-sucree')
WHERE slug IN (
  -- Biscuits
  'oreo-cookies-original-144oz',
  'oreo-cookies-double-stuf-152oz',
  'oreo-cookies-golden-144oz',
  'chips-ahoy-cookies-original-13oz',
  'chips-ahoy-cookies-chewy-13oz',
  'nutter-butter-cookies-16oz',
  'ritz-crackers-original-137oz',
  'premium-saltine-crackers-16oz',
  'nabisco-sociables-crackers-75oz',
  'keebler-club-crackers-original-137oz',
  'keebler-town-house-crackers-137oz',
  'cheez-it-crackers-original-127oz',
  'goldfish-crackers-cheddar-66oz',
  'triscuit-crackers-original-9oz',
  'wheat-thins-crackers-original-91oz',
  'graham-crackers-honey-maid-145oz',
  'teddy-grahams-honey-10oz',
  'animal-crackers-barnums-21oz',
  'fig-newtons-10oz',
  'nilla-wafers-11oz',
  -- Céréales
  'cheerios-original-18oz',
  'cheerios-honey-nut-19oz',
  'frosted-flakes-197oz',
  'fruit-loops-143oz',
  'lucky-charms-16oz',
  'cinnamon-toast-crunch-165oz',
  'cocoa-puffs-155oz',
  'trix-cereal-103oz',
  'reeses-puffs-cereal-13oz',
  'cap-n-crunch-cereal-14oz',
  'cap-n-crunch-crunch-berries-13oz',
  'life-cereal-original-13oz',
  'special-k-original-12oz',
  'corn-flakes-kelloggs-18oz',
  'rice-krispies-12oz',
  'raisin-bran-kelloggs-1875oz',
  'honey-bunches-of-oats-honey-roasted-145oz',
  'grape-nuts-cereal-20oz',
  'quaker-oats-old-fashioned-42oz',
  'quaker-oats-instant-original-12pk',
  'cream-of-wheat-original-28oz',
  'grits-quaker-instant-original-12pk',
  -- Chocolats et confiseries
  'snickers-bar-186oz',
  'snickers-fun-size-bag-1084oz',
  'milky-way-bar-184oz',
  'twix-bar-179oz',
  'mm-peanut-bag-104oz',
  'mm-plain-bag-104oz',
  'reeses-peanut-butter-cups-2ct',
  'hersheys-milk-chocolate-bar-155oz',
  'hersheys-kisses-milk-chocolate-9oz',
  'kit-kat-bar-15oz',
  'nestle-crunch-bar-155oz',
  'butterfinger-bar-19oz',
  'baby-ruth-bar-21oz',
  '3-musketeers-bar-192oz',
  'york-peppermint-pattie-14oz',
  'almond-joy-bar-161oz',
  'mounds-bar-175oz',
  -- Bonbons
  'skittles-original-bag-9oz',
  'starburst-original-bag-72oz',
  'jolly-rancher-hard-candy-7oz',
  'lifesavers-5-flavors-65oz',
  'werther-original-caramels-55oz',
  'tootsie-roll-midgees-12oz',
  'tootsie-pops-105oz',
  'dum-dums-lollipops-51oz',
  'blow-pops-assorted-105oz',
  'swedish-fish-bag-8oz',
  'sour-patch-kids-bag-8oz',
  'haribo-goldbears-5oz',
  'trolli-sour-brite-crawlers-5oz',
  'twizzlers-strawberry-16oz',
  'red-vines-original-16oz',
  -- Gâteaux et snacks sucrés
  'little-debbie-oatmeal-creme-pies-12ct',
  'little-debbie-nutty-bars-12ct',
  'little-debbie-cosmic-brownies-12ct',
  'little-debbie-zebra-cakes-10ct',
  'hostess-twinkies-10ct',
  'hostess-cupcakes-chocolate-8ct',
  'hostess-donettes-powdered-6ct',
  'hostess-ding-dongs-10ct',
  'pop-tarts-frosted-strawberry-8ct',
  'pop-tarts-frosted-brown-sugar-cinnamon-8ct',
  'pop-tarts-frosted-smores-8ct',
  'nutrigrain-bars-strawberry-8ct',
  'nature-valley-granola-bars-oats-honey-6ct',
  'quaker-chewy-granola-bars-chocolate-chip-8ct'
);

-- ============================================
-- ÉPICERIE SALÉE (depuis alimentaire)
-- ============================================
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'epicerie-salee')
WHERE slug IN (
  -- Chips
  'lays-potato-chips-classic-10oz',
  'lays-potato-chips-bbq-775oz',
  'lays-potato-chips-sour-cream-onion-775oz',
  'doritos-nacho-cheese-9oz',
  'doritos-cool-ranch-9oz',
  'tostitos-scoops-10oz',
  'tostitos-restaurant-style-13oz',
  'fritos-original-corn-chips-95oz',
  'cheetos-crunchy-85oz',
  'cheetos-puffs-8oz',
  'ruffles-original-9oz',
  'ruffles-cheddar-sour-cream-775oz',
  'pringles-original-51oz',
  'pringles-sour-cream-onion-51oz',
  'pringles-cheddar-cheese-51oz',
  'kettle-brand-sea-salt-chips-5oz',
  'cape-cod-potato-chips-original-8oz',
  'utz-potato-chips-original-95oz',
  'wise-potato-chips-bbq-85oz',
  -- Snacks salés
  'combos-cheddar-cheese-pretzel-63oz',
  'chex-mix-traditional-875oz',
  'gardetto-snack-mix-original-86oz',
  'pretzels-snyder-mini-16oz',
  'pretzels-rold-gold-tiny-twists-16oz',
  'popcorn-orville-redenbacher-movie-butter-3ct',
  'popcorn-act-ii-butter-lovers-6ct',
  'smartfood-white-cheddar-popcorn-65oz',
  'skinny-pop-original-45oz',
  -- Noix et fruits secs
  'planters-mixed-nuts-10oz',
  'planters-dry-roasted-peanuts-16oz',
  'planters-cashews-halves-pieces-8oz',
  'blue-diamond-almonds-whole-natural-6oz',
  'emerald-almonds-100-calorie-packs-7ct',
  'sunmaid-raisins-9oz'
);

-- ============================================
-- CONSERVES ET CONDIMENTS (depuis alimentaire)
-- ============================================
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'conserves-condiments')
WHERE slug IN (
  -- Sauces
  'heinz-ketchup-20oz',
  'heinz-ketchup-32oz',
  'hunts-ketchup-24oz',
  'frenchs-yellow-mustard-14oz',
  'guldens-spicy-brown-mustard-12oz',
  'hellmanns-real-mayonnaise-30oz',
  'kraft-mayo-30oz',
  'miracle-whip-dressing-30oz',
  -- Sauces BBQ et marinades
  'kraft-bbq-sauce-original-18oz',
  'sweet-baby-rays-bbq-sauce-original-18oz',
  'bulls-eye-bbq-sauce-original-18oz',
  'stubb-bbq-sauce-original-18oz',
  'a1-steak-sauce-10oz',
  'lea-perrins-worcestershire-sauce-10oz',
  'soy-sauce-kikkoman-10oz',
  'teriyaki-sauce-kikkoman-10oz',
  'sriracha-huy-fong-17oz',
  'tabasco-hot-sauce-2oz',
  'tabasco-hot-sauce-5oz',
  'franks-redhot-original-12oz',
  'louisiana-hot-sauce-6oz',
  'cholula-hot-sauce-5oz',
  'valentina-hot-sauce-12oz',
  -- Sauces pour pâtes
  'ragu-traditional-pasta-sauce-24oz',
  'ragu-meat-pasta-sauce-24oz',
  'prego-traditional-pasta-sauce-24oz',
  'prego-meat-pasta-sauce-24oz',
  'bertolli-marinara-sauce-24oz',
  'classico-tomato-basil-pasta-sauce-24oz',
  'hunts-pasta-sauce-traditional-24oz',
  -- Conserves
  'del-monte-corn-whole-kernel-1525oz',
  'del-monte-green-beans-cut-145oz',
  'del-monte-peas-sweet-15oz',
  'del-monte-mixed-vegetables-145oz',
  'del-monte-tomato-sauce-8oz',
  'del-monte-diced-tomatoes-145oz',
  'del-monte-peaches-sliced-29oz',
  'del-monte-fruit-cocktail-29oz',
  'green-giant-corn-whole-kernel-1525oz',
  'green-giant-green-beans-cut-145oz',
  'green-giant-peas-sweet-15oz',
  'libby-pumpkin-15oz',
  'goya-black-beans-155oz',
  'goya-red-kidney-beans-155oz',
  'goya-pinto-beans-155oz',
  'goya-chickpeas-155oz',
  'bushs-baked-beans-original-28oz',
  'bushs-black-beans-15oz',
  'hormel-spam-12oz',
  'hormel-corned-beef-hash-15oz',
  'hormel-chili-with-beans-15oz',
  'hormel-chili-no-beans-15oz',
  'dinty-moore-beef-stew-15oz',
  'chef-boyardee-ravioli-beef-15oz',
  'chef-boyardee-spaghetti-meatballs-15oz',
  'chef-boyardee-beefaroni-15oz',
  'campbell-chicken-noodle-soup-105oz',
  'campbell-tomato-soup-105oz',
  'campbell-cream-of-mushroom-soup-105oz',
  'progresso-chicken-noodle-soup-19oz',
  'progresso-minestrone-soup-19oz',
  -- Tuna et conserves de poisson
  'bumble-bee-tuna-chunk-light-water-5oz',
  'starkist-tuna-chunk-light-water-5oz',
  'chicken-of-the-sea-tuna-chunk-light-5oz',
  'brunswick-sardines-oil-375oz',
  'king-oscar-sardines-olive-oil-375oz',
  -- Condiments antillais
  'grace-jerk-seasoning-mild-10oz',
  'grace-jerk-seasoning-hot-10oz',
  'grace-cock-soup-mix-17oz',
  'grace-fish-tea-soup-mix-17oz',
  'grace-coconut-milk-14oz',
  'grace-coconut-cream-14oz',
  'walkerswood-jerk-seasoning-10oz',
  'walkerswood-jerk-marinade-17oz',
  'badia-sazon-completa-56oz',
  'badia-adobo-seasoning-16oz',
  'goya-sofrito-12oz',
  'goya-recaito-12oz',
  'goya-mojo-criollo-24oz',
  'goya-adobo-all-purpose-28oz'
);

-- ============================================
-- NETTOYAGE: Supprimer les anciennes catégories inutilisées
-- ============================================
-- Après avoir vérifié que tous les produits sont migrés:
-- DELETE FROM categories WHERE slug IN ('alimentaire', 'divers');

-- ============================================
-- VÉRIFICATION: Compter les produits par catégorie
-- ============================================
-- SELECT c.slug, COUNT(p.id) as product_count
-- FROM categories c
-- LEFT JOIN products p ON p.category_id = c.id
-- GROUP BY c.id, c.slug
-- ORDER BY c.display_order;
