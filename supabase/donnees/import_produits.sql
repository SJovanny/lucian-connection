-- Importation massive des produits
BEGIN;

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                '14-spices-13648460',
                22.0,
                '{"fr": {"name": "14 spices"}, "en": {"name": "14 spices"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/90B57AA9-A8FE-13F0-E978-CB24874D52BA-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                '3x-cereal-13648360',
                40.0,
                '{"fr": {"name": "3x cereal"}, "en": {"name": "3x cereal"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/C604E168-97AD-BC4C-23DB-1F5AB39B9382-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'adobo-seasoning-13648461',
                4.5,
                '{"fr": {"name": "Adobo seasoning"}, "en": {"name": "Adobo seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/fd18f79d1c1a205a9c1d076cf3b6552ca8f7cf96/51A2AAB0-2732-7DC9-A99D-D61520608695-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'african-pride---moisture-miracle-16357975',
                13.5,
                '{"fr": {"name": "african pride - moisture miracle"}, "en": {"name": "african pride - moisture miracle"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'african-pride-oil-14287752',
                13.0,
                '{"fr": {"name": "African pride oil"}, "en": {"name": "African pride oil"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/73DDFAB6-1DFC-4E17-B0B4-530B46C65363-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'african-pride-setting-mouse-14287240',
                10.0,
                '{"fr": {"name": "African pride setting mouse"}, "en": {"name": "African pride setting mouse"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/97A9076E-E295-52CE-EA03-40B3A75F5876-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'african-s-best-shampoo-14287540',
                6.0,
                '{"fr": {"name": "African\u2019s Best Shampoo"}, "en": {"name": "African\u2019s Best Shampoo"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/22EBFE6B-66E1-EA20-FE4F-F5FAD80C395B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'ajax-cleaner-15585374',
                5.5,
                '{"fr": {"name": "AJAX CLEANER"}, "en": {"name": "AJAX CLEANER"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/7A78AF82-68D5-2B7C-90D5-FDDA0590EAA2-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'alba-lessive-15585376',
                11.04,
                '{"fr": {"name": "Alba lessive"}, "en": {"name": "Alba lessive"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/0CFB495F-2768-86B1-B8A5-A6FB6A1F8528-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'alba-vaisselle-15585385',
                2.4,
                '{"fr": {"name": "Alba vaisselle"}, "en": {"name": "Alba vaisselle"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/BF8371F7-6FF8-4EF2-57C3-36F686542B44-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'alba-vaisselle-big-15585392',
                3.4,
                '{"fr": {"name": "Alba vaisselle big"}, "en": {"name": "Alba vaisselle big"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/C74A047F-CEA5-6FE4-5B0D-1B9C636B1D35-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'alcolado-glacial-13648599',
                4.5,
                '{"fr": {"name": "Alcolado glacial"}, "en": {"name": "Alcolado glacial"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5B9CE676-BF75-9DDD-D4D1-C30169B4F898-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'all-purpose-seasoning-13648465',
                22.0,
                '{"fr": {"name": "All purpose seasoning"}, "en": {"name": "All purpose seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/CE094FA1-0962-E5F6-00A4-303458FDEC2B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'all-purpose-seasoning-13648466',
                22.0,
                '{"fr": {"name": "All purpose seasoning"}, "en": {"name": "All purpose seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/4985900B-331D-6315-911B-C37729D63A59-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'almond-essence-13648456',
                20.0,
                '{"fr": {"name": "Almond essence"}, "en": {"name": "Almond essence"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/7C065A70-794A-85BE-FDA6-37DAEC0DFD95-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'aloe-vera-16275977',
                3.0,
                '{"fr": {"name": "aloe vera"}, "en": {"name": "aloe vera"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/9F2DCF09-2C23-11A3-A3C8-EAD33320D7AB-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'ammens-powder-13648562',
                12.0,
                '{"fr": {"name": "Ammens powder"}, "en": {"name": "Ammens powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/7EF412E8-B238-E8D2-E6E1-894DEF03B484-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'ammens-powder-small-14287766',
                6.0,
                '{"fr": {"name": "Ammens powder small"}, "en": {"name": "Ammens powder small"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/80849B70-7E40-5EC5-4722-0E25910633E5-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'ampro-gel-black-14287209',
                4.0,
                '{"fr": {"name": "Ampro gel black"}, "en": {"name": "Ampro gel black"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5ECBA147-76A8-5D43-BAF0-B4FF6E6DA9FE-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'anis-13648419',
                4.0,
                '{"fr": {"name": "Anis"}, "en": {"name": "Anis"}}',
                'https://storage.googleapis.com/f7w-product-images/a063154551f2652c980e692ed6f0ba631ea4de99/66CC22CA-5FFE-5A61-1DA2-87ED25335EFD-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'apple-juice-14285622',
                1.0,
                '{"fr": {"name": "Apple Juice"}, "en": {"name": "Apple Juice"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/9EC57E08-B990-96E6-E48C-4B4AC398C4C9-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'aqua-max-15076508',
                5.0,
                '{"fr": {"name": "Aqua max"}, "en": {"name": "Aqua max"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/FF01E57D-F926-44C1-6BAB-F47EFA955CDB-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'armaf-le-parfait-13648575',
                50.0,
                '{"fr": {"name": "Armaf le parfait"}, "en": {"name": "Armaf le parfait"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'arms---hammer-3-in-1-bodywash-13648582',
                7.0,
                '{"fr": {"name": "Arms & hammer 3 in 1 bodywash"}, "en": {"name": "Arms & hammer 3 in 1 bodywash"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/EC852B26-06FC-11DE-FA47-D93A5A74EA65-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'arms---hammer-baking-soda-13648595',
                15.0,
                '{"fr": {"name": "Arms & hammer baking soda"}, "en": {"name": "Arms & hammer baking soda"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/7C799029-FEBC-4D03-7C2C-235844E27F8B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'arms---hammer-body-wash-13648563',
                7.0,
                '{"fr": {"name": "Arms & hammer body wash"}, "en": {"name": "Arms & hammer body wash"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F12EFCDD-EB99-150F-1D65-E1E66C40A16F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'arms---hammer-roll-on-13648597',
                8.0,
                '{"fr": {"name": "Arms & hammer roll on"}, "en": {"name": "Arms & hammer roll on"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'avanti-silicon-bambu-brillo-14287509',
                7.0,
                '{"fr": {"name": "Avanti Silicon Bambu Brillo"}, "en": {"name": "Avanti Silicon Bambu Brillo"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/C41B06A9-197A-CA50-B6F6-4A759FB0934C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'avanti-silicon-shampoo-14287498',
                14.0,
                '{"fr": {"name": "Avanti Silicon Shampoo"}, "en": {"name": "Avanti Silicon Shampoo"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/82E9A4D1-6C87-1E13-B6A2-2F82E933C4B4-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'avanti-silicon-treat-14287501',
                14.0,
                '{"fr": {"name": "Avanti Silicon Treat"}, "en": {"name": "Avanti Silicon Treat"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/B551D6DB-97AF-BA53-2859-FCCCADC2A78D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'avon-roll-on-13648546',
                3.0,
                '{"fr": {"name": "Avon roll on"}, "en": {"name": "Avon roll on"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/D77E11DA-1BBE-A4FD-42DD-03C03D774CFF-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'baba-de-caracol-rinse-14287642',
                9.0,
                '{"fr": {"name": "Baba de caracol rinse"}, "en": {"name": "Baba de caracol rinse"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/C7F1D37C-DA75-8B32-B831-24809EEA5C10-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'baba-de-caracol-shampoo-14287279',
                9.0,
                '{"fr": {"name": "Baba de caracol shampoo"}, "en": {"name": "Baba de caracol shampoo"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FAD3022C-1FAF-76DC-8CE4-285A066FAAEB-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'baba-de-caracol-treatment-14287702',
                13.0,
                '{"fr": {"name": "Baba de caracol treatment"}, "en": {"name": "Baba de caracol treatment"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/74B0BB44-850C-F2F0-8655-87534224AD46-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'baby-oil-aloe-13648559',
                12.0,
                '{"fr": {"name": "Baby oil aloe"}, "en": {"name": "Baby oil aloe"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5A19AC84-03F4-B7C5-81FB-E67714A24741-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'baby-oil-cocoa-butter-13648560',
                12.0,
                '{"fr": {"name": "Baby oil cocoa butter"}, "en": {"name": "Baby oil cocoa butter"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/9EBDE930-8329-1A56-E92D-6BE32922C704-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'baby-powder-13648550',
                6.0,
                '{"fr": {"name": "Baby powder"}, "en": {"name": "Baby powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/7269827F-7C1D-24B0-C4BC-215D2DA3A432-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'baby-soap-26872441',
                3.0,
                '{"fr": {"name": "baby soap"}, "en": {"name": "baby soap"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'badia-adobo-seasoning-28052575',
                22.0,
                '{"fr": {"name": "Badia adobo seasoning"}, "en": {"name": "Badia adobo seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/2719C0AF-2BAE-1651-858A-32D4E3FBBD25-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'badia-jerk-seasoning-13648427',
                22.0,
                '{"fr": {"name": "Badia jerk seasoning"}, "en": {"name": "Badia jerk seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F6467E3B-DDB1-9820-66B9-FC5975361043-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'baking-powder-13648403',
                9.0,
                '{"fr": {"name": "Baking powder"}, "en": {"name": "Baking powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5B103F37-585B-0581-DC5B-387816AC8565-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'baking-powder-13648404',
                2.5,
                '{"fr": {"name": "Baking powder"}, "en": {"name": "Baking powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/4B580367-DC8B-8B5D-0349-E7233BB7E2B7-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'baron-baking-powder-26494495',
                2.5,
                '{"fr": {"name": "baron baking powder"}, "en": {"name": "baron baking powder"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'baron-banana-ketchup-13648415',
                8.0,
                '{"fr": {"name": "Baron banana ketchup"}, "en": {"name": "Baron banana ketchup"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/8D94FF75-91FF-3C18-F8D7-F2318478E170-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'baron-pepper-13901299',
                18.0,
                '{"fr": {"name": "Baron Pepper"}, "en": {"name": "Baron Pepper"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/C41CF8A7-2269-F4BF-2DEC-B4B01F9A1725-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'baron-pepper-small-13901307',
                9.0,
                '{"fr": {"name": "Baron pepper small"}, "en": {"name": "Baron pepper small"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/AA72ED71-13CB-0788-B116-326797B6E01E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'bay-rum-13648577',
                20.0,
                '{"fr": {"name": "Bay rum"}, "en": {"name": "Bay rum"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/0EDF2345-A14B-5ECC-80DA-91FCCAC06628-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'bay-rum-13648578',
                7.0,
                '{"fr": {"name": "Bay rum"}, "en": {"name": "Bay rum"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/79226A6A-EF0D-272D-9B50-F6A96E60CC74-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'big-seasoning-14286142',
                70.0,
                '{"fr": {"name": "Big seasoning"}, "en": {"name": "Big seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/0F869ED9-08D9-836A-814D-12C6D140DD5A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'big-supligen-26440399',
                3.5,
                '{"fr": {"name": "Big supligen"}, "en": {"name": "Big supligen"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'big-tang-14287835',
                25.0,
                '{"fr": {"name": "Big Tang"}, "en": {"name": "Big Tang"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/8C478BE7-29CD-9AF0-5FB0-8B90DB5D8A79-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'black-castor-oil-13648555',
                12.0,
                '{"fr": {"name": "Black castor oil"}, "en": {"name": "Black castor oil"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'black-eye-peas-13648398',
                5.0,
                '{"fr": {"name": "Black eye peas"}, "en": {"name": "Black eye peas"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/EB5E023E-373E-5923-E660-98F71881F69A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'black-pepper-13648406',
                10.0,
                '{"fr": {"name": "Black pepper"}, "en": {"name": "Black pepper"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/0DF1B753-133B-58FD-94D8-F56235FD0C56-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'black-soap-13648525',
                3.0,
                '{"fr": {"name": "Black soap"}, "en": {"name": "Black soap"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/E6DEEF7D-25B8-3C7F-7B2E-B4B2E29F4870-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'blue-magic-hair-13648605',
                9.0,
                '{"fr": {"name": "Blue magic hair"}, "en": {"name": "Blue magic hair"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/B97CF775-3096-1446-549B-A619808E48DA-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'blue-soap--3x--13648521',
                6.0,
                '{"fr": {"name": "Blue soap (3x)"}, "en": {"name": "Blue soap (3x)"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/4BFE2398-3FB4-494E-4677-A71BBBBAFC70-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'blue-soap-13648522',
                2.0,
                '{"fr": {"name": "Blue soap"}, "en": {"name": "Blue soap"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FBC219DE-A08E-0676-5588-2BAB850BA0CE-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'bod-men-body-spray-13648545',
                12.0,
                '{"fr": {"name": "BOD men body spray"}, "en": {"name": "BOD men body spray"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/C3CBF35A-7688-E553-CA8D-1F3DCDB8F018-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'body-fantasies-13648532',
                10.0,
                '{"fr": {"name": "Body fantasies"}, "en": {"name": "Body fantasies"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/7562DBA0-9757-20C1-2746-6410C4FA4896-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'body-mist-13648568',
                20.0,
                '{"fr": {"name": "Body mist"}, "en": {"name": "Body mist"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'bokini-balm-13648588',
                10.0,
                '{"fr": {"name": "Bokini balm"}, "en": {"name": "Bokini balm"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'boost-13986311',
                5.0,
                '{"fr": {"name": "Boost"}, "en": {"name": "Boost"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/31E67A69-FE5E-D0F6-6216-19418E8CB195-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'botanicals-relaxer-kit-coarse-14287523',
                14.0,
                '{"fr": {"name": "Botanicals Relaxer kit Coarse"}, "en": {"name": "Botanicals Relaxer kit Coarse"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/E14DB4A0-E352-9AE6-7DAB-AD62AF1609DF-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'bounty-sorrel-13648489',
                25.0,
                '{"fr": {"name": "Bounty sorrel"}, "en": {"name": "Bounty sorrel"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/3A3A201A-CE15-3F95-7BA0-9538EBB6B3B2-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'bourbon-cream-cookie-packet-26495415',
                8.0,
                '{"fr": {"name": "bourbon cream cookie packet"}, "en": {"name": "bourbon cream cookie packet"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'bourdon-cream-cookies-single-26414441',
                1.0,
                '{"fr": {"name": "Bourdon cream cookies single"}, "en": {"name": "Bourdon cream cookies single"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'breaktime-cookies-13648344',
                6.0,
                '{"fr": {"name": "Breaktime cookies"}, "en": {"name": "Breaktime cookies"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/0FE5EB75-E53C-C667-F6EE-E7D0D084DC5A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'brillant-parfum-13648576',
                40.0,
                '{"fr": {"name": "Brillant parfum"}, "en": {"name": "Brillant parfum"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'browning-13648405',
                9.0,
                '{"fr": {"name": "Browning"}, "en": {"name": "Browning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/7216B42B-826D-1CCD-DA6E-E69A684FE79F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'bubblers-13648528',
                2.5,
                '{"fr": {"name": "Bubblers"}, "en": {"name": "Bubblers"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/EAD9A5E1-DDC3-4F48-3E9A-AFC203F8248E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'burphrise-body-lotion-13648570',
                18.0,
                '{"fr": {"name": "Burphrise body lotion"}, "en": {"name": "Burphrise body lotion"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/E268516F-9C94-E547-66ED-A5033233613E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'burphrise-body-spray-13648571',
                18.0,
                '{"fr": {"name": "Burphrise body spray"}, "en": {"name": "Burphrise body spray"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/59A52317-D8A2-E2F4-9DE1-FB0991074651-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'butter-cookies-big-14286107',
                18.0,
                '{"fr": {"name": "Butter Cookies Big"}, "en": {"name": "Butter Cookies Big"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/394841DE-E1AE-2CC1-FC66-E773DF971AA9-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'buzz-16275971',
                4.0,
                '{"fr": {"name": "buzz"}, "en": {"name": "buzz"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'cabotine-gres-14287205',
                25.0,
                '{"fr": {"name": "Cabotine Gres"}, "en": {"name": "Cabotine Gres"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F22C3925-3095-E434-D077-019B64571949-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'cabotine-parfum-13648573',
                40.0,
                '{"fr": {"name": "Cabotine parfum"}, "en": {"name": "Cabotine parfum"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'cabotine-rose-gift-set-14287202',
                35.0,
                '{"fr": {"name": "Cabotine Rose Gift set"}, "en": {"name": "Cabotine Rose Gift set"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/A05A43ED-11A8-83B9-14E1-0FEB2B7CE066-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'cake-mix-13648362',
                9.0,
                '{"fr": {"name": "Cake mix"}, "en": {"name": "Cake mix"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/96E7CC14-2A17-9818-8F11-BFF393833C03-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'cake-sprinkles-13648410',
                3.0,
                '{"fr": {"name": "Cake sprinkles"}, "en": {"name": "Cake sprinkles"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5436356E-F934-572C-38F1-4503CECFD2CE-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'camel-jaune-16278696',
                8.0,
                '{"fr": {"name": "camel jaune"}, "en": {"name": "camel jaune"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'camel-noir-16278697',
                10.0,
                '{"fr": {"name": "camel noir"}, "en": {"name": "camel noir"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'campari-13648484',
                25.0,
                '{"fr": {"name": "Campari"}, "en": {"name": "Campari"}}',
                'https://storage.googleapis.com/f7w-product-images/647f6d1148ce1eebcac18ade9a455fbe3bbc3c9b/97544093-BBD0-3120-6F6F-F669345B1971-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'campari-shot-16309955',
                3.0,
                '{"fr": {"name": "campari shot"}, "en": {"name": "campari shot"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'candy-16282755',
                2.5,
                '{"fr": {"name": "candy"}, "en": {"name": "candy"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'capilo-oils-13648561',
                6.0,
                '{"fr": {"name": "Capilo oils"}, "en": {"name": "Capilo oils"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/B7BB69D3-4446-5F65-1B59-78DEAFCE7BB3-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'caprisun-13648513',
                1.5,
                '{"fr": {"name": "Caprisun"}, "en": {"name": "Caprisun"}}',
                'https://storage.googleapis.com/f7w-product-images/0f083c950eb5eac81b6cd220123a1631c4e9bbf8/A5B5B532-0A6D-1E20-8470-F29D434E7110-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'carbolic-soap-13648526',
                6.0,
                '{"fr": {"name": "Carbolic soap"}, "en": {"name": "Carbolic soap"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'caribbean-delight-26414537',
                4.0,
                '{"fr": {"name": "Caribbean delight"}, "en": {"name": "Caribbean delight"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/D60C1C19-1A31-C2BB-9408-477345F5248E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'cayenne-pepper-powder-13648441',
                22.0,
                '{"fr": {"name": "Cayenne pepper powder"}, "en": {"name": "Cayenne pepper powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/0DD19150-CFE7-C06B-9A77-46EEFE58E3AD-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'cayenne-pepper-powder-13648442',
                6.0,
                '{"fr": {"name": "Cayenne pepper powder"}, "en": {"name": "Cayenne pepper powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/A3312265-DD7C-AA1F-FD60-C70437BF0ADA-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'charle-s-chocolate-13648350',
                2.5,
                '{"fr": {"name": "Charle\u2019s chocolate"}, "en": {"name": "Charle\u2019s chocolate"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/06BD0837-FA40-9C25-33CE-CE384B03B16A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'charlie-parfum-13648574',
                25.0,
                '{"fr": {"name": "Charlie parfum"}, "en": {"name": "Charlie parfum"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'cheerios-14286227',
                15.0,
                '{"fr": {"name": "Cheerios"}, "en": {"name": "Cheerios"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/8B9EC239-9732-EB4C-29A4-40D303556F05-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'cheerios-honey--nut-14286222',
                35.0,
                '{"fr": {"name": "Cheerios honey &nut"}, "en": {"name": "Cheerios honey &nut"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/88967287-2142-0AC3-4790-74DE3E79503B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'cheese-puffs-16275982',
                2.5,
                '{"fr": {"name": "cheese puffs"}, "en": {"name": "cheese puffs"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'cheese-sauce-13648394',
                3.0,
                '{"fr": {"name": "Cheese sauce"}, "en": {"name": "Cheese sauce"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/542671A3-B3C3-C25A-32F8-5E6AD3D0137E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'chicken-soup-13648436',
                2.5,
                '{"fr": {"name": "Chicken soup"}, "en": {"name": "Chicken soup"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/42F74477-4519-ADE5-E575-DB337F951A8F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'chilli---garlic-sauce-13648412',
                6.0,
                '{"fr": {"name": "Chilli & garlic sauce"}, "en": {"name": "Chilli & garlic sauce"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'chips-13648357',
                2.0,
                '{"fr": {"name": "Chips"}, "en": {"name": "Chips"}}',
                'https://storage.googleapis.com/f7w-product-images/ef8f87566068ef882eff2bc7b76874acf2499742/5944663B-5933-E972-6A8C-701CE2EC8F75-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'chow-men-16136881',
                3.0,
                '{"fr": {"name": "Chow men"}, "en": {"name": "Chow men"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'chow-men-noodles-13648380',
                3.0,
                '{"fr": {"name": "Chow men noodles"}, "en": {"name": "Chow men noodles"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/C7F65215-E304-AED2-C384-2C9BFDC4551F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'chubby-26440388',
                1.5,
                '{"fr": {"name": "Chubby"}, "en": {"name": "Chubby"}}',
                'https://storage.googleapis.com/f7w-product-images/b0272b4bd8aa9bb647b19cf0533d81ca6243827d/4207FD44-A2DB-AC8E-5D9D-91806AA03CB5-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'cinnamon-powder-13648444',
                5.0,
                '{"fr": {"name": "Cinnamon powder"}, "en": {"name": "Cinnamon powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/B013EEB8-87DF-ABC5-3CE1-DE510FB742FF-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'citrocol-13648579',
                20.0,
                '{"fr": {"name": "Citrocol"}, "en": {"name": "Citrocol"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5DC9247C-0F72-7F2C-1E48-6EB08409F049-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'citrocol-13648580',
                7.0,
                '{"fr": {"name": "Citrocol"}, "en": {"name": "Citrocol"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/740582B2-D189-52F7-6861-1D423E94A0F3-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'citrocol-mentholated-13648581',
                8.0,
                '{"fr": {"name": "Citrocol mentholated"}, "en": {"name": "Citrocol mentholated"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/455BA498-FC54-5763-A52B-D6AAB963F715-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'clove-13648393',
                3.0,
                '{"fr": {"name": "Clove"}, "en": {"name": "Clove"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/E9238CAF-8D52-944B-F543-970D665608A8-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'clément-13648493',
                25.0,
                '{"fr": {"name": "Cl\u00e9ment"}, "en": {"name": "Cl\u00e9ment"}}',
                'https://storage.googleapis.com/f7w-product-images/c4e09f8879f3b8af298c386e56fe5cc44ab76f08/8AAD056E-6659-EC1D-0C19-BF1B5F61A801-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'clément-noir-13648487',
                35.0,
                '{"fr": {"name": "Cl\u00e9ment noir"}, "en": {"name": "Cl\u00e9ment noir"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/E54C0D33-0DDA-1C4B-F940-DEB68535AEE5-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'clément-normal-13648492',
                20.0,
                '{"fr": {"name": "Cl\u00e9ment Normal"}, "en": {"name": "Cl\u00e9ment Normal"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/BF1F2D98-B0EE-0FE8-E830-BB7159F52B72-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'coca-cola-13648507',
                2.0,
                '{"fr": {"name": "Coca cola"}, "en": {"name": "Coca cola"}}',
                'https://storage.googleapis.com/f7w-product-images/8a54c1db331779c819df271f6e88b67122ce428e/A03C4685-03EC-B7C4-0BDC-DDEA8BC509B7-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'cocoa-stick-15792837',
                6.0,
                '{"fr": {"name": "Cocoa Stick"}, "en": {"name": "Cocoa Stick"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/606E0DF3-FADB-BF5D-1BE1-07321B0A814A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'coconut-oil-13648409',
                22.0,
                '{"fr": {"name": "Coconut oil"}, "en": {"name": "Coconut oil"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5E24BA1B-3299-2F54-19F0-A9BDF3A8F83C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'coffee-mate-13648366',
                15.0,
                '{"fr": {"name": "Coffee mate"}, "en": {"name": "Coffee mate"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/B5D76365-4CF7-8CC2-4DFF-4714D0C94F02-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'coffee-mate-13648365',
                8.5,
                '{"fr": {"name": "Coffee mate"}, "en": {"name": "Coffee mate"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FBA9C0D2-EDA5-3AED-E88B-F87F18416B69-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'colgate-2-in-1-13648591',
                3.0,
                '{"fr": {"name": "Colgate 2 in 1"}, "en": {"name": "Colgate 2 in 1"}}',
                'https://storage.googleapis.com/f7w-product-images/888dbe8e9f8a4c78a4dcb66c75a8052d799f5dfe/9AE8F7AF-275C-037A-A732-FFD8ED84CFB7-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'colgate-mouthwash-13648547',
                8.0,
                '{"fr": {"name": "Colgate mouthwash"}, "en": {"name": "Colgate mouthwash"}}',
                'https://storage.googleapis.com/f7w-product-images/1fd11793767c2fc1d1e0694b757b0427aa52d329/B55102D1-079B-F38B-518E-905D3C4276F9-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'colgate-toothpaste-13648548',
                6.0,
                '{"fr": {"name": "Colgate toothpaste"}, "en": {"name": "Colgate toothpaste"}}',
                'https://storage.googleapis.com/f7w-product-images/1fd11793767c2fc1d1e0694b757b0427aa52d329/FA686B6A-ABE8-2F66-150D-9F1660B49178-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'combos-14286064',
                2.5,
                '{"fr": {"name": "Combos"}, "en": {"name": "Combos"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/EE45185D-77DE-83C6-1655-31ED5FC95975-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'complete-seasoning-13648422',
                18.0,
                '{"fr": {"name": "Complete seasoning"}, "en": {"name": "Complete seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F5D9342F-853C-55DF-5194-CD183B1840E8-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'complete-seasoning-13648425',
                9.0,
                '{"fr": {"name": "Complete seasoning"}, "en": {"name": "Complete seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/6B488298-2976-D893-5047-B614F81735EC-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'complete-seasoning-13648423',
                5.0,
                '{"fr": {"name": "Complete seasoning"}, "en": {"name": "Complete seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/DF9B397D-426D-1B7F-DE00-F2C78B75BF7C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'cookies---cream-oreo-14285941',
                8.0,
                '{"fr": {"name": "Cookies & cream oreo"}, "en": {"name": "Cookies & cream oreo"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/0FB01ACE-CD27-D17B-2DF1-4D7B387CBB9A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'corn-combo-13648352',
                2.5,
                '{"fr": {"name": "Corn combo"}, "en": {"name": "Corn combo"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'cornmeal-13648389',
                3.0,
                '{"fr": {"name": "Cornmeal"}, "en": {"name": "Cornmeal"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/66C15048-85A0-25C2-1D94-DF4166D0B269-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'corona-beer-26440422',
                2.0,
                '{"fr": {"name": "Corona beer"}, "en": {"name": "Corona beer"}}',
                'https://storage.googleapis.com/f7w-product-images/0887f4625d9455e14396d7ed28dfedba2ac81104/E8137F57-D4AD-A7D8-A29F-6EF164AC40A9-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'cream-of-nature-conditioner-14287764',
                13.0,
                '{"fr": {"name": "Cream of nature conditioner"}, "en": {"name": "Cream of nature conditioner"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/BF80E7E5-A8C9-AA70-AEBE-6AEBCE1D20EC-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'cream-of-wheat-13648361',
                14.0,
                '{"fr": {"name": "Cream of wheat"}, "en": {"name": "Cream of wheat"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/939B814F-F17D-255E-C8A5-8278C1E4151B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'creamed-coconut-13648375',
                3.0,
                '{"fr": {"name": "Creamed coconut"}, "en": {"name": "Creamed coconut"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/48B846C7-D88D-23ED-AA61-FE8BBA260BC3-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'creme-of-nature-shampoo-14287762',
                18.0,
                '{"fr": {"name": "Creme of nature shampoo"}, "en": {"name": "Creme of nature shampoo"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/1B9868F0-E6B8-D2FC-2E76-9B5051F3E681-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'crix-biscuits-13648348',
                6.0,
                '{"fr": {"name": "Crix biscuits"}, "en": {"name": "Crix biscuits"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/39739FC0-370A-34DA-EDDA-5483EAB90F14-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'crix-single-26495746',
                2.5,
                '{"fr": {"name": "crix single"}, "en": {"name": "crix single"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'crix-wheat-26414417',
                7.0,
                '{"fr": {"name": "Crix wheat"}, "en": {"name": "Crix wheat"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/A3A71694-922F-349D-0CD7-C9E099B7A877-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'curry-powder-13648443',
                5.0,
                '{"fr": {"name": "Curry powder"}, "en": {"name": "Curry powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FEBCFD95-1B03-DC7E-69C1-F4CB7FD95132-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'curry-powder-small-16379603',
                3.0,
                '{"fr": {"name": "curry powder small"}, "en": {"name": "curry powder small"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'custard-13648401',
                3.0,
                '{"fr": {"name": "Custard"}, "en": {"name": "Custard"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/8F8758D4-FDDB-9657-3EE1-47E2F50DF264-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'custard-creams-13986377',
                2.0,
                '{"fr": {"name": "Custard creams"}, "en": {"name": "Custard creams"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/DCD3F807-7612-A046-CF6D-C95C9AA1C2FA-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'dax-kocatah-13648604',
                9.0,
                '{"fr": {"name": "Dax kocatah"}, "en": {"name": "Dax kocatah"}}',
                'https://storage.googleapis.com/f7w-product-images/a95a126df0e602844f1b286c9ca74fa4a424deac/B8914E93-20ED-86E2-1684-731624542525-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'dermasil-lotion-13648607',
                6.0,
                '{"fr": {"name": "Dermasil lotion"}, "en": {"name": "Dermasil lotion"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/8676CA34-8F60-9408-FE68-2404154D527A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'desperados-en-boite-13648499',
                4.5,
                '{"fr": {"name": "Desperados en boite"}, "en": {"name": "Desperados en boite"}}',
                'https://storage.googleapis.com/f7w-product-images/46df39ff81391816a3acb1cbb3c5530d5af512a4/FBB3BA8A-F73D-9807-02C3-4B8526FCE5BB-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'desperados-normal-13648468',
                3.5,
                '{"fr": {"name": "Desperados normal"}, "en": {"name": "Desperados normal"}}',
                'https://storage.googleapis.com/f7w-product-images/b7393fa3028ebd8af7f19f31830c26ed71908ed1/FDB305FB-12F3-B0FC-353F-758D1B89B3A9-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'desperados-red-13648469',
                3.5,
                '{"fr": {"name": "Desperados red"}, "en": {"name": "Desperados red"}}',
                'https://storage.googleapis.com/f7w-product-images/47999d838c0a6916c62ef9df605bb66da5ddfdb3/7CAF177B-BDC8-662D-CBF0-E0A3A01D710E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'didier-13648514',
                2.5,
                '{"fr": {"name": "Didier"}, "en": {"name": "Didier"}}',
                'https://storage.googleapis.com/f7w-product-images/aff15abe198ed40cf8f55eb297fd75015b709181/A450C0C1-0DD6-DE16-30C6-64FD132BCAA4-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'dis-lui-extreme-14287492',
                25.0,
                '{"fr": {"name": "Dis-Lui Extreme"}, "en": {"name": "Dis-Lui Extreme"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F7AE2D10-3021-057B-A038-347CF307B6A7-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'dixee-biscuit-13648347',
                8.0,
                '{"fr": {"name": "Dixee biscuit"}, "en": {"name": "Dixee biscuit"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/2C1F2906-4BCD-B221-2F6A-CC230D9A239D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'dixee-biscuit-1x-13648355',
                2.0,
                '{"fr": {"name": "Dixee biscuit 1x"}, "en": {"name": "Dixee biscuit 1x"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5D7D49BD-8D3A-02B1-DFE8-3F35A70DBD8B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'dixee-crackers-galletas-26414436',
                2.5,
                '{"fr": {"name": "Dixee Crackers Galletas"}, "en": {"name": "Dixee Crackers Galletas"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/E6D50445-5B2B-0956-F728-E325378FCDDD-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'domino-cream-cookies-single-26414448',
                1.5,
                '{"fr": {"name": "Domino cream cookies single"}, "en": {"name": "Domino cream cookies single"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/DBB3A429-C311-BA2F-D702-04522F3F0443-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'double-diamond-14287491',
                25.0,
                '{"fr": {"name": "Double Diamond"}, "en": {"name": "Double Diamond"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/D638A6C2-7DE7-0CCB-D517-6FDFC1B293DD-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'double-hearts-perfum-14287489',
                20.0,
                '{"fr": {"name": "Double Hearts perfum"}, "en": {"name": "Double Hearts perfum"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/97265A18-B059-6640-0FEF-AD7FE760F5C1-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'dove-men-care-13648596',
                8.0,
                '{"fr": {"name": "Dove men care"}, "en": {"name": "Dove men care"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/085F2850-E3F0-69E4-BD16-D52410F7EBA7-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'dove-soap-13648527',
                2.0,
                '{"fr": {"name": "Dove soap"}, "en": {"name": "Dove soap"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/B9FDD126-67A2-0E43-C2F6-C21ED2669E40-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'dove-women-13986324',
                8.0,
                '{"fr": {"name": "Dove women"}, "en": {"name": "Dove women"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/24127D15-7A1D-D4DA-B1A3-DBDA7F7B3207-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'downy-fabric-softener-13648592',
                6.5,
                '{"fr": {"name": "Downy fabric softener"}, "en": {"name": "Downy fabric softener"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/BE36122A-3B05-C18D-2D46-8789B859EECC-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'dreads-molding-cream-13648554',
                12.0,
                '{"fr": {"name": "Dreads molding cream"}, "en": {"name": "Dreads molding cream"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/637233E9-938A-F987-F1C9-4C8285887DE6-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'duquesne-13648498',
                25.0,
                '{"fr": {"name": "Duquesne"}, "en": {"name": "Duquesne"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/8782BE53-824C-4F85-D674-AA8112BBA736-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'eau-1l-13648516',
                2.5,
                '{"fr": {"name": "Eau 1L"}, "en": {"name": "Eau 1L"}}',
                'https://storage.googleapis.com/f7w-product-images/7fbe9b88f366ead9be3303d63ce4ac8741f48a7d/06B947DE-C68D-438E-2A38-6EE665C7BDEF-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'eau-1l5-13648517',
                3.0,
                '{"fr": {"name": "Eau 1L5"}, "en": {"name": "Eau 1L5"}}',
                'https://storage.googleapis.com/f7w-product-images/c348ffd441393b3babadef676d0d309c4af2bace/AF215C84-7B1E-2D59-1846-5426FEEA6F8F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'eau-50cl-13648515',
                1.5,
                '{"fr": {"name": "Eau 50cl"}, "en": {"name": "Eau 50cl"}}',
                'https://storage.googleapis.com/f7w-product-images/afb3f57d4c37c0759f950c2ed6bb483bf9621105/45937F18-F9E5-FBE9-A47F-982BA607FAC2-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'eau-aromatisée-50cl-13648506',
                2.0,
                '{"fr": {"name": "Eau aromatis\u00e9e 50cl"}, "en": {"name": "Eau aromatis\u00e9e 50cl"}}',
                'https://storage.googleapis.com/f7w-product-images/f863f068944ed3290b1b7047bb53290c196b7f80/928B01FC-54E4-4B2D-0C72-6C076E0D5F73-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'eco-gel-13648543',
                12.0,
                '{"fr": {"name": "Eco gel"}, "en": {"name": "Eco gel"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/BC15495D-C1A0-9C62-BB1E-04AA2DA09635-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'eco-gel-13648544',
                4.5,
                '{"fr": {"name": "Eco gel"}, "en": {"name": "Eco gel"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/EA64CCE8-7E90-8016-CC0E-2098197CB31C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'eco-styler-krystal-gel-14287507',
                4.0,
                '{"fr": {"name": "Eco Styler Krystal Gel"}, "en": {"name": "Eco Styler Krystal Gel"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/917DB35C-2AFA-3390-E1BC-DECE6D24162B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'emerge-13986262',
                5.0,
                '{"fr": {"name": "Emerge"}, "en": {"name": "Emerge"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/ECB5CB3D-7A1C-116D-196E-1D12E0E3B48B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'evaporated-milk-13648368',
                3.0,
                '{"fr": {"name": "Evaporated Milk"}, "en": {"name": "Evaporated Milk"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/1A56C8DF-B6E0-FAE4-6870-9F609DA8878E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'evaporated-milk-13648367',
                1.5,
                '{"fr": {"name": "Evaporated Milk"}, "en": {"name": "Evaporated Milk"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/4721176E-4AC1-C4B5-E47E-5CB61355A98F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'fabuloso-28-fl-14404652',
                7.0,
                '{"fr": {"name": "Fabuloso 28 FL"}, "en": {"name": "Fabuloso 28 FL"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/83587FE8-8C61-471A-7C25-81CC7552EEBD-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'fabuloso-13648551',
                12.0,
                '{"fr": {"name": "Fabuloso"}, "en": {"name": "Fabuloso"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/95945739-EEAA-620D-5821-0F7A1B947E4E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'fanta-13986236',
                3.0,
                '{"fr": {"name": "Fanta"}, "en": {"name": "Fanta"}}',
                'https://storage.googleapis.com/f7w-product-images/10e1c135afca5a6d9ad3e2b86d979a10ef603721/037D0ABE-119D-C3F9-7DF1-714E801EA13B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'faxe-26779401',
                3.5,
                '{"fr": {"name": "Faxe"}, "en": {"name": "Faxe"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'ferrol-compound-13648549',
                20.0,
                '{"fr": {"name": "Ferrol compound"}, "en": {"name": "Ferrol compound"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/65AEDC13-6578-9ED7-0145-68ACF24C8217-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'fireball-13648485',
                45.0,
                '{"fr": {"name": "Fireball"}, "en": {"name": "Fireball"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/877ADD2D-17E2-B50F-46D6-C117362D4731-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'fish-seasoning-13648464',
                8.0,
                '{"fr": {"name": "Fish seasoning"}, "en": {"name": "Fish seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/BA6FF2BD-63AB-1E86-BE6C-B967DEDEFFC0-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'freez-non-alcoolique-16275979',
                3.0,
                '{"fr": {"name": "freez non alcoolique"}, "en": {"name": "freez non alcoolique"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'froot-loops-cereal-13648359',
                30.0,
                '{"fr": {"name": "Froot loops cereal"}, "en": {"name": "Froot loops cereal"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/7DDCE50C-24C4-8712-7277-7089F40E1B58-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'fruit-shoot-13986301',
                1.5,
                '{"fr": {"name": "Fruit shoot"}, "en": {"name": "Fruit shoot"}}',
                'https://storage.googleapis.com/f7w-product-images/21916276854421b4e379d944ed6a3617e53c9eb3/C37B9065-6682-44DF-C2F2-201F3E1320C8-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'fruta-26440397',
                3.0,
                '{"fr": {"name": "Fruta"}, "en": {"name": "Fruta"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'garlic-powder--medium--13648440',
                9.0,
                '{"fr": {"name": "Garlic powder (medium)"}, "en": {"name": "Garlic powder (medium)"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5144004C-E93B-33F1-284B-75D982625167-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'gautier-13648482',
                50.0,
                '{"fr": {"name": "Gautier"}, "en": {"name": "Gautier"}}',
                'https://storage.googleapis.com/f7w-product-images/77d8be74acda7a5ecd792707438790ba013f44b9/AB85B918-9055-09FD-DEC7-63798BF19C45-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'ginger-beer-16275978',
                2.5,
                '{"fr": {"name": "ginger beer"}, "en": {"name": "ginger beer"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'ginger-nuts-14016397',
                4.0,
                '{"fr": {"name": "Ginger nuts"}, "en": {"name": "Ginger nuts"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/AE542013-867D-E92F-2419-5C6AC2F68CCB-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'ginger-powder-13648392',
                5.0,
                '{"fr": {"name": "Ginger powder"}, "en": {"name": "Ginger powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/DAA5649E-5E03-0DD2-BD3E-3468105AE3C8-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'goodie-vanilla-cake-26495414',
                1.0,
                '{"fr": {"name": "Goodie vanilla cake"}, "en": {"name": "Goodie vanilla cake"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'gravy-browning-13648453',
                18.0,
                '{"fr": {"name": "Gravy browning"}, "en": {"name": "Gravy browning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/86AEBE45-B877-6AD8-36F2-7ACB8890A196-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'gravy-browning-13648454',
                9.0,
                '{"fr": {"name": "Gravy browning"}, "en": {"name": "Gravy browning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/8EE487CF-7426-938B-CC50-4F9826B6ACDD-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'green-seasoning-13648449',
                18.0,
                '{"fr": {"name": "Green seasoning"}, "en": {"name": "Green seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5875ED8E-FE0A-4DD4-280C-9B5279CDC57B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'green-seasoning-13648450',
                9.0,
                '{"fr": {"name": "Green seasoning"}, "en": {"name": "Green seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/12EB67BA-5A81-2346-D0E2-DB1BEC2F93E9-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'grenadine-sirop-13648457',
                14.0,
                '{"fr": {"name": "Grenadine sirop"}, "en": {"name": "Grenadine sirop"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/E2B9D8AD-2ABF-DAEE-27D1-C85835AC9F59-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'guess-1981gifset-14287479',
                60.0,
                '{"fr": {"name": "GUESS 1981Gifset"}, "en": {"name": "GUESS 1981Gifset"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/320F9C86-EE10-7111-C53C-343E2958EA0F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'guess-perfum-13648535',
                20.0,
                '{"fr": {"name": "Guess perfum"}, "en": {"name": "Guess perfum"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/33F5BAFF-27BC-0654-D921-33D124748B0F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'guess-seductive-red-14308530',
                70.0,
                '{"fr": {"name": "Guess seductive red"}, "en": {"name": "Guess seductive red"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/DA39EFB0-A008-0330-858E-8CFD673B1C40-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'guinness-13648470',
                3.5,
                '{"fr": {"name": "Guinness"}, "en": {"name": "Guinness"}}',
                'https://storage.googleapis.com/f7w-product-images/1c4906130aa0805714fffd1bf08490d730b36d0e/E3975E2C-7EF5-BB4C-EEDB-609B1A8F1329-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'guinness-smooth-13648476',
                5.0,
                '{"fr": {"name": "Guinness smooth"}, "en": {"name": "Guinness smooth"}}',
                'https://storage.googleapis.com/f7w-product-images/1c4906130aa0805714fffd1bf08490d730b36d0e/876607C7-63CC-07E3-23A3-74F8EE3F7FAF-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'gulden-s-mustard-13648413',
                6.0,
                '{"fr": {"name": "Gulden\u2019s mustard"}, "en": {"name": "Gulden\u2019s mustard"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/A9725EA2-DE78-6B3B-36E5-7AFF73E25957-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'heineken-13648467',
                2.0,
                '{"fr": {"name": "Heineken"}, "en": {"name": "Heineken"}}',
                'https://storage.googleapis.com/f7w-product-images/7a36dee1f7c31d616cd20df111bc364862f872ff/F86817A1-58A6-092F-2577-9E3002722F61-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'heineken-en-boite-13648500',
                3.5,
                '{"fr": {"name": "Heineken en boite"}, "en": {"name": "Heineken en boite"}}',
                'https://storage.googleapis.com/f7w-product-images/29a5b22bf3501ad25b71a2b32f57b68f6ded1f0a/73FDDD6A-DD7B-9A89-47BF-BFCDE3C68A7D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'heinz-baked-beans-13648383',
                3.0,
                '{"fr": {"name": "Heinz baked beans"}, "en": {"name": "Heinz baked beans"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/08FA8D41-B1C7-EB07-D8CE-974E926762EC-ORIGINAL.jpg',
                72.0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'heinz-hot-dog-relish-13648390',
                7.0,
                '{"fr": {"name": "Heinz hot dog relish"}, "en": {"name": "Heinz hot dog relish"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/C76E2611-A82A-5FE0-1400-40EFEBF3C756-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'heinz-sweet-relish-13648391',
                6.0,
                '{"fr": {"name": "Heinz sweet relish"}, "en": {"name": "Heinz sweet relish"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/8DBC6ADD-F891-D95E-DB6F-4BD77B505385-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'heinz-tomato-ketchup-13648370',
                8.0,
                '{"fr": {"name": "Heinz Tomato ketchup"}, "en": {"name": "Heinz Tomato ketchup"}}',
                'https://storage.googleapis.com/f7w-product-images/290a593e52a8e88b76a8ec90be842fad39823c88/62A784E4-0C5E-E993-5354-BDE9C671401D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'hellman-s-mayonnaise-13648378',
                16.0,
                '{"fr": {"name": "Hellman\u2019s mayonnaise"}, "en": {"name": "Hellman\u2019s mayonnaise"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/13874451-7DD9-C03F-5760-895A771DB488-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'hellman-s-mayonnaise-13648379',
                8.0,
                '{"fr": {"name": "Hellman\u2019s mayonnaise"}, "en": {"name": "Hellman\u2019s mayonnaise"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/9A52A955-AE81-BEEC-87DB-B16685F61CF1-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'hennessy-13648483',
                90.0,
                '{"fr": {"name": "Hennessy"}, "en": {"name": "Hennessy"}}',
                'https://storage.googleapis.com/f7w-product-images/02d14c8e39a988d0a74cc6f2faa3e10779f6eb35/52E99B26-276A-CE29-1A52-5654ECE462F5-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'hennessy-13648503',
                60.0,
                '{"fr": {"name": "Hennessy"}, "en": {"name": "Hennessy"}}',
                'https://storage.googleapis.com/f7w-product-images/63bd150a0b94e288eea1a22c03ece19cc32e282b/7AC8B24F-F0A4-FFD3-44A9-1C8810687C03-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'honey-roasted-peanuts-13648416',
                2.5,
                '{"fr": {"name": "Honey roasted peanuts"}, "en": {"name": "Honey roasted peanuts"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/ADD7B026-D058-DC1D-4BE5-465433AAAEAD-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'hungry-jack-14287769',
                7.0,
                '{"fr": {"name": "Hungry Jack"}, "en": {"name": "Hungry Jack"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/4B452983-EF50-7063-5776-9A4CD91748E8-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'hungry-jack-syrup-14301314',
                9.0,
                '{"fr": {"name": "Hungry jack syrup"}, "en": {"name": "Hungry jack syrup"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F236BEC8-B25C-E5F1-A176-232D5A973AFB-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'ice-cold-analgesic-gel-13648603',
                6.0,
                '{"fr": {"name": "Ice cold analgesic gel"}, "en": {"name": "Ice cold analgesic gel"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/C3B08437-925E-A1D6-A779-5071E40DF8CA-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'ice-smirnoff-13648474',
                4.0,
                '{"fr": {"name": "Ice smirnoff"}, "en": {"name": "Ice smirnoff"}}',
                'https://storage.googleapis.com/f7w-product-images/7e79ff60b750f4d2c4b41ad3658e6233ee592be6/5C1743D5-AC7D-312E-5D49-F115C1A3D7C5-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'icecle-15792815',
                6.0,
                '{"fr": {"name": "Icecle"}, "en": {"name": "Icecle"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/128CA403-4D8A-8F9A-F7B8-23D65D596CD5-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'icy-soda-13648505',
                2.5,
                '{"fr": {"name": "Icy soda"}, "en": {"name": "Icy soda"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/07101595-DD01-C6AF-BCE5-F0019F01698F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'infacol-colic-relief-13648584',
                8.0,
                '{"fr": {"name": "Infacol colic relief"}, "en": {"name": "Infacol colic relief"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/55CD6B4B-2213-D44E-3A77-1828A6DA5765-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'irish-spring--3x--13648524',
                6.0,
                '{"fr": {"name": "Irish spring (3x)"}, "en": {"name": "Irish spring (3x)"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/72A3960D-87CB-5F81-6862-A7F64167DB24-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'irish-spring-13648523',
                2.0,
                '{"fr": {"name": "Irish spring"}, "en": {"name": "Irish spring"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/11270565-A911-08F3-F930-74C717F2178B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'italian-dressing-13648400',
                8.0,
                '{"fr": {"name": "Italian dressing"}, "en": {"name": "Italian dressing"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/84FE77E4-536B-3AB3-A4C4-E924CE68F738-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'italian-dressing-13648402',
                12.0,
                '{"fr": {"name": "Italian dressing"}, "en": {"name": "Italian dressing"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F18E17F1-ABB9-B5C0-7E19-2C18DA83907E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'jam-16136887',
                2.0,
                '{"fr": {"name": "Jam"}, "en": {"name": "Jam"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'jamaica-honey-jerk-28052530',
                12.0,
                '{"fr": {"name": "jamaica honey jerk"}, "en": {"name": "jamaica honey jerk"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/BECA0004-3558-DF8C-0406-793BAC3EDFE4-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'jamaican-green-seasoning-28052528',
                15.0,
                '{"fr": {"name": "jamaican Green seasoning"}, "en": {"name": "jamaican Green seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/B26C788B-2223-A6CB-FD0E-2F9A748428D8-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'jaze-fluid-13648593',
                12.0,
                '{"fr": {"name": "Jaze fluid"}, "en": {"name": "Jaze fluid"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'jergens-cream-13648537',
                12.0,
                '{"fr": {"name": "Jergens cream"}, "en": {"name": "Jergens cream"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/226E34B9-F446-9738-4168-F16D0BA44234-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'jerk-hot---spicy-28052523',
                15.0,
                '{"fr": {"name": "jerk hot & spicy"}, "en": {"name": "jerk hot & spicy"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/DA93BC65-C79A-B518-40C8-CD8211529F88-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'jerk-seasoning-original-13648428',
                6.0,
                '{"fr": {"name": "Jerk seasoning original"}, "en": {"name": "Jerk seasoning original"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/03F62396-E2C1-1E3C-119E-B4D249B89171-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'jif-peanut-butter-big-16242918',
                16.0,
                '{"fr": {"name": "jif peanut butter big"}, "en": {"name": "jif peanut butter big"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'jif-peanut-butter-small-16242919',
                9.0,
                '{"fr": {"name": "jif peanut butter small"}, "en": {"name": "jif peanut butter small"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'johnsons-baby-oil-regular-200ml-14287573',
                8.0,
                '{"fr": {"name": "Johnsons Baby Oil Regular 200ml"}, "en": {"name": "Johnsons Baby Oil Regular 200ml"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/A85C0E50-7DFB-400F-5F2E-5F198F52C6A1-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'johnsons-baby-oil-regular-89ml-14287575',
                5.0,
                '{"fr": {"name": "Johnsons Baby Oil Regular 89ml"}, "en": {"name": "Johnsons Baby Oil Regular 89ml"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/DB87D747-80D9-D109-24CA-E70C37084F7D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'johnson-s-baby-oil-13648557',
                13.0,
                '{"fr": {"name": "Johnson\u2019s baby oil"}, "en": {"name": "Johnson\u2019s baby oil"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/D214515E-CF2F-0E08-A14C-3ACB4F8EAF14-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'johnson-s-baby-oil-aloe-13648558',
                13.0,
                '{"fr": {"name": "Johnson\u2019s baby oil aloe"}, "en": {"name": "Johnson\u2019s baby oil aloe"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5A19AC84-03F4-B7C5-81FB-E67714A24741-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'johnson-s-baby-powder-13648556',
                8.0,
                '{"fr": {"name": "Johnson\u2019s baby powder"}, "en": {"name": "Johnson\u2019s baby powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/75EE38D1-E4B1-E52D-4BB2-051B6B1F6F57-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'johnson-s-cream-big-13648536',
                12.0,
                '{"fr": {"name": "Johnson\u2019s cream big"}, "en": {"name": "Johnson\u2019s cream big"}}',
                'https://storage.googleapis.com/f7w-product-images/91943a4d0727d11193f7c36cf27c80da719a7066/9803EAB8-5123-D21C-5719-93B36ED6A890-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'johnson-s-oil-gel-15076569',
                8.0,
                '{"fr": {"name": "Johnson\u2019s oil gel"}, "en": {"name": "Johnson\u2019s oil gel"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/5721DB5C-B6BE-94AF-CDE9-C44DFD6C9BEF-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'jp-chenet-13648495',
                6.0,
                '{"fr": {"name": "JP chenet"}, "en": {"name": "JP chenet"}}',
                'https://storage.googleapis.com/f7w-product-images/8a54c1db331779c819df271f6e88b67122ce428e/7A31A925-0941-F5C4-C443-E6EFE7AB33C9-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'kiss-cake-13648349',
                3.0,
                '{"fr": {"name": "Kiss cake"}, "en": {"name": "Kiss cake"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/EF699824-4247-0A31-E77C-5927E957F1EE-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'kool-aid-15076496',
                10.0,
                '{"fr": {"name": "Kool-Aid"}, "en": {"name": "Kool-Aid"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/9FD135E2-7710-9EF7-3062-D1F4ACDEA72C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'mayo-13648408',
                9.0,
                '{"fr": {"name": "Mayo"}, "en": {"name": "Mayo"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/072ADD62-5EA2-7F6D-DA1A-EA64EB1C6B4E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'lady-sticks-13648608',
                8.0,
                '{"fr": {"name": "Lady sticks"}, "en": {"name": "Lady sticks"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/25946941-B23E-4A83-2D11-3DC167031613-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'lava-bits-26414489',
                3.0,
                '{"fr": {"name": "Lava bits"}, "en": {"name": "Lava bits"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/184E9125-8BAA-60AD-EDFE-D3D98B5871CD-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'lavish-13648479',
                5.0,
                '{"fr": {"name": "Lavish"}, "en": {"name": "Lavish"}}',
                'https://storage.googleapis.com/f7w-product-images/c92120c95c6a6e18ad0f916164b1a914df109aba/4761447A-62D0-8ED9-DDEA-7D1809958ECB-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'lemon-lime-bitter-15076545',
                3.0,
                '{"fr": {"name": "Lemon Lime bitter"}, "en": {"name": "Lemon Lime bitter"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/325CC261-8663-5688-E680-BB9B9E459AC2-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'lighter-16316455',
                2.5,
                '{"fr": {"name": "lighter"}, "en": {"name": "lighter"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'lorraine-13648472',
                2.5,
                '{"fr": {"name": "Lorraine"}, "en": {"name": "Lorraine"}}',
                'https://storage.googleapis.com/f7w-product-images/d04a843ed77e39941bc74075241db22e80419329/11B85C5C-C40A-4B04-3945-D49B513694E6-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'lorraine-en-boite-13648501',
                3.5,
                '{"fr": {"name": "Lorraine en boite"}, "en": {"name": "Lorraine en boite"}}',
                'https://storage.googleapis.com/f7w-product-images/da797992e89e93069e9462f798532fbf33563b1a/3C71B903-2BBA-8C8E-60FB-9D7DC8F4693E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'lorraine-ice-16136876',
                3.0,
                '{"fr": {"name": "Lorraine Ice"}, "en": {"name": "Lorraine Ice"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'lottabody-milk-honey-mousse-14287758',
                12.0,
                '{"fr": {"name": "Lottabody milk&honey mousse"}, "en": {"name": "Lottabody milk&honey mousse"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5AA8A59D-22E6-FABA-8582-3AB2D1CD6111-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'lottabody-setting-mousse-14287757',
                11.0,
                '{"fr": {"name": "Lottabody setting mousse"}, "en": {"name": "Lottabody setting mousse"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/C01DFE89-B591-84DB-75BF-AF80A727457A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'lucky-charms-14286190',
                15.0,
                '{"fr": {"name": "Lucky charms"}, "en": {"name": "Lucky charms"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/1F236CB6-A7DA-96BC-4445-9DDD4EDA1E64-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'lucky-charms-cereal-13648358',
                30.0,
                '{"fr": {"name": "Lucky charms cereal"}, "en": {"name": "Lucky charms cereal"}}',
                'https://storage.googleapis.com/f7w-product-images/1787fd89ba55031591e0f24cb028ff17bac520d2/12890334-6F62-4287-06A8-3B698D6C9297-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'lucozade-13648511',
                4.0,
                '{"fr": {"name": "Lucozade"}, "en": {"name": "Lucozade"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/71BF464D-8BBA-C983-0E38-8472B8987C2C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'luncheon-meat-chicken-13648396',
                5.0,
                '{"fr": {"name": "Luncheon meat chicken"}, "en": {"name": "Luncheon meat chicken"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/328FED6F-8346-754F-DAB7-A8A778B302AE-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'luncheon-meat-pork-13648397',
                6.0,
                '{"fr": {"name": "Luncheon meat pork"}, "en": {"name": "Luncheon meat pork"}}',
                'https://storage.googleapis.com/f7w-product-images/46d7697ac145c6937d080a720120c10869a7bd81/BB62389F-C1E0-9218-F8E3-96E35FFB08C0-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'lysol-fresh-13648552',
                3.0,
                '{"fr": {"name": "Lysol fresh"}, "en": {"name": "Lysol fresh"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/25C4F298-B63A-97AE-658E-45AA20F04A0C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'mac---cheese-13648382',
                6.0,
                '{"fr": {"name": "Mac & cheese"}, "en": {"name": "Mac & cheese"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/2D13ABEA-3F4F-DDDE-718F-C40CC6F40C76-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'mac---cheese-13648381',
                3.0,
                '{"fr": {"name": "Mac & cheese"}, "en": {"name": "Mac & cheese"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/71F3E949-D5E3-7C08-ED36-83B4277B4A29-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'macaroni-13648395',
                3.0,
                '{"fr": {"name": "Macaroni"}, "en": {"name": "Macaroni"}}',
                'https://storage.googleapis.com/f7w-product-images/d4f21a01b63e1708fc74067543bc49c530e9413d/A5259827-C29D-7E8D-4E09-B503845238F7-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'maggi-all-purpose-13648432',
                14.0,
                '{"fr": {"name": "Maggi all purpose"}, "en": {"name": "Maggi all purpose"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FA0B7FDE-8C84-49AC-6545-94734474930C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'maggi-all-purpose-13648433',
                7.0,
                '{"fr": {"name": "Maggi all purpose"}, "en": {"name": "Maggi all purpose"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/30402C03-5F94-F04E-44E2-E7B7339EECB7-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'maggi-chicken-cube-13648434',
                15.0,
                '{"fr": {"name": "Maggi chicken cube"}, "en": {"name": "Maggi chicken cube"}}',
                'https://storage.googleapis.com/f7w-product-images/759d932c222fbcd0ea379b41d741c37560823d71/7D9EF3EB-FF28-B6A2-DF33-60DDE85662B0-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'maggi-chicken-cube-13648435',
                3.0,
                '{"fr": {"name": "Maggi chicken cube"}, "en": {"name": "Maggi chicken cube"}}',
                'https://storage.googleapis.com/f7w-product-images/759d932c222fbcd0ea379b41d741c37560823d71/7D9EF3EB-FF28-B6A2-DF33-60DDE85662B0-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'maggi-chicken-seasoning-13648429',
                14.0,
                '{"fr": {"name": "Maggi chicken seasoning"}, "en": {"name": "Maggi chicken seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/3A6D4805-1DB8-D5D0-883C-CCDF3AAD241F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'maggi-chicken-seasoning-13648430',
                7.0,
                '{"fr": {"name": "Maggi chicken seasoning"}, "en": {"name": "Maggi chicken seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FCB3EBB8-50C7-B823-2EB1-FAF1CBF3B6AE-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'magnum-13648473',
                6.0,
                '{"fr": {"name": "Magnum"}, "en": {"name": "Magnum"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/4E9942F7-8C4D-AD03-479A-375349D44C5B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'martini-13648486',
                15.0,
                '{"fr": {"name": "Martini"}, "en": {"name": "Martini"}}',
                'https://storage.googleapis.com/f7w-product-images/2f658e0b2e487178e09d41bd7aa722b77bb43754/13B6B96E-6EA9-54D4-B149-A41EA5EFBC27-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'mauby-13648509',
                4.0,
                '{"fr": {"name": "Mauby"}, "en": {"name": "Mauby"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/70AF3688-1997-EFA0-80FF-E89B97DE1BE6-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'mauby-sirop-13648458',
                14.0,
                '{"fr": {"name": "Mauby sirop"}, "en": {"name": "Mauby sirop"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/A5381026-CFA1-B8DC-DC08-2A68834B4084-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'melli-melows-13648353',
                1.0,
                '{"fr": {"name": "Melli melows"}, "en": {"name": "Melli melows"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'menthol-crystals-13648590',
                10.0,
                '{"fr": {"name": "Menthol crystals"}, "en": {"name": "Menthol crystals"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/3A72C179-7D10-28D2-328F-3F547EAB1226-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'mercier-13648481',
                60.0,
                '{"fr": {"name": "Mercier"}, "en": {"name": "Mercier"}}',
                'https://storage.googleapis.com/f7w-product-images/fb31184264a3f18106922a58ca822a3132ab72aa/C29FE4B3-79EC-1BF3-1647-E18F87D97C4D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'mini-butter-cookies-14286110',
                11.0,
                '{"fr": {"name": "Mini Butter cookies"}, "en": {"name": "Mini Butter cookies"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/856A713C-F16F-12F5-48C2-33138B59CF91-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'mini-hungry-jack-14287771',
                3.0,
                '{"fr": {"name": "Mini Hungry Jack"}, "en": {"name": "Mini Hungry Jack"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/793AEE1A-4636-57E5-1619-6812100CEC1D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'mini-oreo-14286003',
                3.0,
                '{"fr": {"name": "Mini oreo"}, "en": {"name": "Mini oreo"}}',
                'https://storage.googleapis.com/f7w-product-images/459707ce2c8d2934d48c6493a9109a0b510b37e0/847E8CF8-973F-28D3-0B8C-BACC0D434D4B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'miss-armaf-perfum-13648566',
                60.0,
                '{"fr": {"name": "Miss Armaf perfum"}, "en": {"name": "Miss Armaf perfum"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'miss-key-dady-hair-big-14287221',
                14.0,
                '{"fr": {"name": "Miss key dady hair Big"}, "en": {"name": "Miss key dady hair Big"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/D5932184-0B24-9D13-4C3A-A4887E3EAF64-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'monster-energy-drink-13648512',
                3.5,
                '{"fr": {"name": "Monster energy drink"}, "en": {"name": "Monster energy drink"}}',
                'https://storage.googleapis.com/f7w-product-images/7e87073f299b056769734080c5c675e0e7e883a6/C683CEC6-44C5-ADA4-2397-8ECBC2C00125-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'multivitamin-syrup-13648586',
                13.0,
                '{"fr": {"name": "Multivitamin syrup"}, "en": {"name": "Multivitamin syrup"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/2D54B538-0738-531B-3D09-8F53BBA5E10B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'mustarcream-13648585',
                10.0,
                '{"fr": {"name": "Mustarcream"}, "en": {"name": "Mustarcream"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/4F261F3C-E62B-D3F3-3A19-B8873E45C7E5-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'mystic-romance-perfume-13648569',
                18.0,
                '{"fr": {"name": "Mystic romance perfume"}, "en": {"name": "Mystic romance perfume"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/650D2F32-AEF4-8419-3604-B73A44F1E7D0-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'new-brand-prestige-fashinista-14287408',
                60.0,
                '{"fr": {"name": "New Brand Prestige Fashinista"}, "en": {"name": "New Brand Prestige Fashinista"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/01F4F220-34A1-5226-0E6F-61E01BD26C52-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'new-brand-prestige-silence-14287357',
                60.0,
                '{"fr": {"name": "New Brand Prestige Silence"}, "en": {"name": "New Brand Prestige Silence"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/BF412A14-75A5-573F-5004-65B077434B37-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'new-brand-the-nb-14287454',
                60.0,
                '{"fr": {"name": "New Brand The NB"}, "en": {"name": "New Brand The NB"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5BC0A986-50EF-3A18-B914-6EEB18A8D9E7-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'new-brand-volcano-14287475',
                60.0,
                '{"fr": {"name": "New Brand Volcano"}, "en": {"name": "New Brand Volcano"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5ECDDD77-D20A-6CD6-51B7-5D99D1885C5E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'nibbles-chocolate-26414483',
                2.0,
                '{"fr": {"name": "Nibbles chocolate"}, "en": {"name": "Nibbles chocolate"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/E1F29EAD-36E5-A71D-21F1-A8EB337B1314-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'nicolas-feuillatte-13648480',
                60.0,
                '{"fr": {"name": "Nicolas feuillatte"}, "en": {"name": "Nicolas feuillatte"}}',
                'https://storage.googleapis.com/f7w-product-images/10e1c135afca5a6d9ad3e2b86d979a10ef603721/319E6639-1145-1D98-8840-96FE9AA1D87D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'no-lye-relaxer-14287742',
                27.0,
                '{"fr": {"name": "No lye relaxer"}, "en": {"name": "No lye relaxer"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/29190A25-4B45-9964-6ADA-F93F2EDDED08-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'oasis-13648519',
                2.5,
                '{"fr": {"name": "Oasis"}, "en": {"name": "Oasis"}}',
                'https://storage.googleapis.com/f7w-product-images/a8ccbdcb3236f95fcdbbd5434ce40e299b280be2/343B8386-DE06-7139-1B4E-74AAE5274FF8-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'oats-13648388',
                3.0,
                '{"fr": {"name": "Oats"}, "en": {"name": "Oats"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/0EA2B635-0C5C-5579-D61C-72F6551978C1-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'old-bay-seasoning-28052499',
                13.0,
                '{"fr": {"name": "Old bay seasoning"}, "en": {"name": "Old bay seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/70BB1BD4-4246-7837-7035-A5B7C9F8C199-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'onion-powder-13648438',
                15.0,
                '{"fr": {"name": "Onion powder"}, "en": {"name": "Onion powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/3CC418B0-5402-9658-AB4E-0F8F8045B697-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'onion-powder-13648439',
                9.0,
                '{"fr": {"name": "Onion powder"}, "en": {"name": "Onion powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/9BD33D1C-0A6B-515E-3080-434EC3171728-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'oreo-cereal-14286165',
                8.9,
                '{"fr": {"name": "Oreo cereal"}, "en": {"name": "Oreo cereal"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/19C13CC2-8DE0-7BC7-3204-5968B12268DA-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'ors-aloe-shampoo-14287534',
                13.0,
                '{"fr": {"name": "ORS Aloe Shampoo"}, "en": {"name": "ORS Aloe Shampoo"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/A18BD48F-E51D-189D-BB79-91AA19D6EEAC-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'ors-mayonnaise-14287212',
                10.0,
                '{"fr": {"name": "Ors mayonnaise"}, "en": {"name": "Ors mayonnaise"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/E18F356F-E900-79E6-2105-AFEC481D6A9D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'ors-olive-oil-extra-strength-kit-14287517',
                18.0,
                '{"fr": {"name": "ORS Olive Oil Extra Strength Kit"}, "en": {"name": "ORS Olive Oil Extra Strength Kit"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/6467B08B-6C8B-BCB5-9DD6-313AA91D4826-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'ors-replenishing-conditioner-14287580',
                14.0,
                '{"fr": {"name": "ORS Replenishing Conditioner"}, "en": {"name": "ORS Replenishing Conditioner"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FED888B6-D019-8A17-D562-041EE26EB5D2-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'pancake-mix-13648364',
                15.0,
                '{"fr": {"name": "Pancake mix"}, "en": {"name": "Pancake mix"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/16389172-4BD5-C8B6-A4DC-1C3813EC4B81-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'pancake-mix-13648417',
                9.0,
                '{"fr": {"name": "Pancake mix"}, "en": {"name": "Pancake mix"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/D3A0DAE8-A4D1-BF13-98B5-867B8E176D46-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'pancake-mix-800g-14287768',
                12.0,
                '{"fr": {"name": "Pancake Mix 800g"}, "en": {"name": "Pancake Mix 800g"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/96E9EA4A-D137-7FCF-56F3-61D2EA1759C2-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'pancake-syrup-13648407',
                12.0,
                '{"fr": {"name": "Pancake syrup"}, "en": {"name": "Pancake syrup"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/D06FC11A-9C38-A9BF-39DC-129ED7EB2CC1-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'paprika-powder-13648463',
                5.0,
                '{"fr": {"name": "Paprika powder"}, "en": {"name": "Paprika powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F6D08CDC-D32B-0681-AB0F-5A5ED526649B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'paprika-powder-13648420',
                5.0,
                '{"fr": {"name": "Paprika powder"}, "en": {"name": "Paprika powder"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/925A1614-12D0-F99A-625C-3A6F93CDFC0A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'pear-milling-complete-4kg-14287772',
                18.0,
                '{"fr": {"name": "Pear Milling Complete 4kg"}, "en": {"name": "Pear Milling Complete 4kg"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/6FB94525-E93A-7480-36B4-D6A6F608DBBF-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'peardrax-28052591',
                3.0,
                '{"fr": {"name": "peardrax"}, "en": {"name": "peardrax"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/626F6011-08D2-6CD0-4B2C-CFC7C2B53D75-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'peas-13648399',
                5.0,
                '{"fr": {"name": "Peas"}, "en": {"name": "Peas"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'pepper-13648451',
                18.0,
                '{"fr": {"name": "Pepper"}, "en": {"name": "Pepper"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'pepper-13648452',
                9.0,
                '{"fr": {"name": "Pepper"}, "en": {"name": "Pepper"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'pepsi-13986298',
                3.0,
                '{"fr": {"name": "Pepsi"}, "en": {"name": "Pepsi"}}',
                'https://storage.googleapis.com/f7w-product-images/d57782b13b1356c6f6ac69ba114bdd2d0a7fea05/1E805DC6-D117-CA2C-DE44-49B028CCA36A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'peter-pan-peanut-butter-13648369',
                9.0,
                '{"fr": {"name": "Peter pan peanut butter"}, "en": {"name": "Peter pan peanut butter"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5CFA94C5-DE81-CF8D-AB1C-31CA35F582FF-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'ping-pong-13986954',
                0.5,
                '{"fr": {"name": "Ping pong"}, "en": {"name": "Ping pong"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F271A7A3-01F6-7670-4F79-1D9693CA25E0-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'piton-13648475',
                3.0,
                '{"fr": {"name": "Piton"}, "en": {"name": "Piton"}}',
                'https://storage.googleapis.com/f7w-product-images/29a5b22bf3501ad25b71a2b32f57b68f6ded1f0a/EB89D397-23B4-8F83-4131-AB3E7CBD15AA-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'ponch-caribe-13648491',
                45.0,
                '{"fr": {"name": "Ponch caribe"}, "en": {"name": "Ponch caribe"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/6FBA6DC9-0327-E092-A66A-85E3A5EFC34F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'porter-39-13648471',
                3.5,
                '{"fr": {"name": "Porter 39"}, "en": {"name": "Porter 39"}}',
                'https://storage.googleapis.com/f7w-product-images/d9536b613bbca40b1bc9e00d44e8189782c24190/BFAF4811-1260-81CB-375F-4659CDB73835-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'pro-line-comb-thru-14287216',
                12.0,
                '{"fr": {"name": "Pro line comb thru"}, "en": {"name": "Pro line comb thru"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/A70B37B3-F688-77E1-86C9-B796CBEBB150-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'profectiv-prof-no-lay-relaxer-14287603',
                27.0,
                '{"fr": {"name": "Profectiv prof no lay relaxer"}, "en": {"name": "Profectiv prof no lay relaxer"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FD8956C0-0A6B-336D-2774-07173FE8D76E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'raisin-bran-14286179',
                25.0,
                '{"fr": {"name": "Raisin bran"}, "en": {"name": "Raisin bran"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F0FC61AC-A50A-64F9-BBFA-4E7A5E9D37D6-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'razac-cream-13648530',
                10.0,
                '{"fr": {"name": "Razac cream"}, "en": {"name": "Razac cream"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/D385FFAB-6978-3FC2-E31A-B00210D8BA98-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'red-bull-13648518',
                3.0,
                '{"fr": {"name": "Red bull"}, "en": {"name": "Red bull"}}',
                'https://storage.googleapis.com/f7w-product-images/cb3a14c7ed4fa09edea387555d3772030ebf28f6/9FEF5D3F-7641-A18C-42DD-737ACF3DC71A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'red-one-16137824',
                3.0,
                '{"fr": {"name": "Red one"}, "en": {"name": "Red one"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'red-velvet-cake-mix-13648363',
                10.0,
                '{"fr": {"name": "Red velvet cake mix"}, "en": {"name": "Red velvet cake mix"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/9684C42F-03ED-BA1F-F5D1-724950A49E13-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'reggae-jerk-bbq-big-28052548',
                20.0,
                '{"fr": {"name": "reggae jerk bbq big"}, "en": {"name": "reggae jerk bbq big"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/60071B6C-9294-D463-5C09-E5C6A59CE71D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'reggae-jerk-bbq-small-28052542',
                15.0,
                '{"fr": {"name": "reggae jerk bbq small"}, "en": {"name": "reggae jerk bbq small"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/D551E403-64D3-B3C6-4AD6-D831E6F7ED08-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'rhum-dillon-13648497',
                18.0,
                '{"fr": {"name": "Rhum dillon"}, "en": {"name": "Rhum dillon"}}',
                'https://storage.googleapis.com/f7w-product-images/12d64b6a3468aeb5087c9452a81c4ec69147dbcd/BD7DEAD9-B0CF-7812-C616-4284E4CB40A0-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'rhum-jm-13648490',
                25.0,
                '{"fr": {"name": "Rhum JM"}, "en": {"name": "Rhum JM"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/89B5CE0D-C26F-ECDE-AC55-B2C4A5A0557A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'rhum-spice-13648496',
                30.0,
                '{"fr": {"name": "Rhum spice"}, "en": {"name": "Rhum spice"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'rice-coloring-13648437',
                6.0,
                '{"fr": {"name": "Rice coloring"}, "en": {"name": "Rice coloring"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/666B844B-99BE-B50D-5FDE-02CFF6A2817B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'rinju-cream-13648531',
                12.0,
                '{"fr": {"name": "Rinju cream"}, "en": {"name": "Rinju cream"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/D5602376-AB87-DC99-16A0-B7C23C5DAB93-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'ritz-bits-14286096',
                2.0,
                '{"fr": {"name": "Ritz bits"}, "en": {"name": "Ritz bits"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/D7B82843-245B-3414-A29F-C57BE48E05EC-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'ritz-cheese-180g-14286056',
                8.0,
                '{"fr": {"name": "Ritz cheese 180g"}, "en": {"name": "Ritz cheese 180g"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/88DB04A1-F598-B2B8-96C4-88B87B0C6332-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'ritz-snacks-pack-14286059',
                9.0,
                '{"fr": {"name": "Ritz snacks pack"}, "en": {"name": "Ritz snacks pack"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/92FB19C4-11D5-B095-7FA2-887ACAEBDA47-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'robb-ointment-original-13648589',
                8.0,
                '{"fr": {"name": "Robb ointment original"}, "en": {"name": "Robb ointment original"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'rose-body-lotion-13648564',
                15.0,
                '{"fr": {"name": "Rose body lotion"}, "en": {"name": "Rose body lotion"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/BB597070-4986-7285-88FA-072214AE6D0A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'rose-shower-gel-13648565',
                10.0,
                '{"fr": {"name": "Rose shower gel"}, "en": {"name": "Rose shower gel"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/E019878B-2FF9-A124-10D1-70A102E3415E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'rotisserie-chicken-seasoning-13648459',
                22.0,
                '{"fr": {"name": "Rotisserie chicken seasoning"}, "en": {"name": "Rotisserie chicken seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/2E2A7738-6D4D-2780-CFB7-06714963AF05-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'royal-soda-13648508',
                2.0,
                '{"fr": {"name": "Royal soda"}, "en": {"name": "Royal soda"}}',
                'https://storage.googleapis.com/f7w-product-images/242a48bf48d0ee8556fc9169c71c978907458169/49A59573-4C59-A275-774A-67B55BFB33B4-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'rubee-cream-13648529',
                10.0,
                '{"fr": {"name": "Rubee cream"}, "en": {"name": "Rubee cream"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/48FFAE63-0777-90FA-B20D-0B31684445C1-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'rudeboy-13648478',
                6.0,
                '{"fr": {"name": "Rudeboy"}, "en": {"name": "Rudeboy"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/B3CFB933-1F50-0B09-D16C-AE8C3CF24DA5-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'ryan-blake-ny-14287485',
                28.0,
                '{"fr": {"name": "Ryan Blake NY"}, "en": {"name": "Ryan Blake NY"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/3FC1987E-30BB-3BAD-E556-4D1ECBED3361-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'rôtisserie--chicken-26800881',
                9.0,
                '{"fr": {"name": "r\u00f4tisserie  chicken"}, "en": {"name": "r\u00f4tisserie  chicken"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'sachet-13986939',
                0.2,
                '{"fr": {"name": "Sachet"}, "en": {"name": "Sachet"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/9C9E6864-A955-0AC5-ED68-5750878B765D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'salad-cream-13648377',
                6.0,
                '{"fr": {"name": "Salad cream"}, "en": {"name": "Salad cream"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/44554954-BE9D-3AD5-4148-50FB3826B8D6-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'salted-biscuits-1x-13648354',
                2.5,
                '{"fr": {"name": "Salted biscuits 1x"}, "en": {"name": "Salted biscuits 1x"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FFA28C2D-06D7-3E11-0F27-C12D7BEC16B2-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'salted-peanuts-13648356',
                2.0,
                '{"fr": {"name": "Salted peanuts"}, "en": {"name": "Salted peanuts"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/46E73424-FF3A-BE57-6C27-4BA9EBBC281C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'sarah-jessica-3-pieces-fragrance-14287318',
                45.0,
                '{"fr": {"name": "Sarah Jessica 3 pieces fragrance"}, "en": {"name": "Sarah Jessica 3 pieces fragrance"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'sarah-jessica-giftset-14287292',
                50.0,
                '{"fr": {"name": "Sarah Jessica Giftset"}, "en": {"name": "Sarah Jessica Giftset"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'sausage-13648386',
                3.0,
                '{"fr": {"name": "Sausage"}, "en": {"name": "Sausage"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/9AB076FA-3860-B85C-0E62-62AF25777354-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'savon-de-royal-13648572',
                9.0,
                '{"fr": {"name": "Savon de royal"}, "en": {"name": "Savon de royal"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/4369B0CF-BAAC-4253-C7CA-6B8538D58DD9-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'sazon-13648447',
                18.0,
                '{"fr": {"name": "Sazon"}, "en": {"name": "Sazon"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/03C20CF9-B030-B67A-8776-632053AEF547-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'sazon-13648448',
                9.0,
                '{"fr": {"name": "Sazon"}, "en": {"name": "Sazon"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/39F9E8D3-51C7-C080-C9F1-50E3741E5EF4-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'sazon-small-packets-13648446',
                0.5,
                '{"fr": {"name": "Sazon small packets"}, "en": {"name": "Sazon small packets"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/8F884513-764A-A838-AD26-A72CAB149B57-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'sazon-tropical-13648426',
                22.0,
                '{"fr": {"name": "Sazon tropical"}, "en": {"name": "Sazon tropical"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/6CC1B606-17CE-F372-48F2-F5832BBC684D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'sazon-tropical-orange-13648421',
                22.0,
                '{"fr": {"name": "Sazon tropical orange"}, "en": {"name": "Sazon tropical orange"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/23C74380-2528-BA2F-A3DA-2EDC0A98F9B3-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'sazon-tropical-orange-13648424',
                9.0,
                '{"fr": {"name": "Sazon tropical orange"}, "en": {"name": "Sazon tropical orange"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/DDB6D110-9B95-97E7-86BB-1739609D7B02-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'sazon-unite-16136888',
                0.5,
                '{"fr": {"name": "Sazon unite"}, "en": {"name": "Sazon unite"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'schweppes-13648520',
                2.0,
                '{"fr": {"name": "Schweppes"}, "en": {"name": "Schweppes"}}',
                'https://storage.googleapis.com/f7w-product-images/61321c5fa84e6db49f638eeea57d5411bbc41b6a/B19BA369-CD64-40DF-0772-90E15A4E5268-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'sea-belle-tuna-fish-13648384',
                5.0,
                '{"fr": {"name": "Sea belle tuna fish"}, "en": {"name": "Sea belle tuna fish"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/1684E2E4-37ED-E122-90A0-CD4284942737-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'sea-belle-tuna-fish-13648418',
                3.0,
                '{"fr": {"name": "Sea belle tuna fish"}, "en": {"name": "Sea belle tuna fish"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/2475A5B6-FB7F-99C8-56A0-BC8BF4727DB6-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'seamoss'),
                'sea-moss-250g-13648609',
                10.0,
                '{"fr": {"name": "Sea moss 250g"}, "en": {"name": "Sea moss 250g"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F087B21C-C7CF-63B3-A417-CD61A1986CC7-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'seamoss'),
                'sea-moss-gel-13648615',
                10.0,
                '{"fr": {"name": "Sea moss gel"}, "en": {"name": "Sea moss gel"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/9D0CED94-C72E-02D1-E57C-6C806BF086EA-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'seafood-seasoning-13648431',
                8.0,
                '{"fr": {"name": "Seafood seasoning"}, "en": {"name": "Seafood seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/9D03C9D1-DB1C-6A71-14BB-7B31B192FB4E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'seamoss-27471827',
                15.0,
                '{"fr": {"name": "seamoss"}, "en": {"name": "seamoss"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'seamoss'),
                'seamoss-100g-13648612',
                6.0,
                '{"fr": {"name": "Seamoss 100g"}, "en": {"name": "Seamoss 100g"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/D9C5B538-C298-2121-B7ED-F6F9AD0D8AA8-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'seamoss'),
                'seamoss-150g-13648611',
                8.0,
                '{"fr": {"name": "Seamoss 150g"}, "en": {"name": "Seamoss 150g"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/74CFBB96-160A-066F-0765-7553618B1EB9-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'seamoss'),
                'seamoss-170g-13648613',
                8.5,
                '{"fr": {"name": "Seamoss 170g"}, "en": {"name": "Seamoss 170g"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/24E20B3E-5971-2185-0EA6-73BF86DEBB0A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'seamoss'),
                'seamoss-200g-13648614',
                9.0,
                '{"fr": {"name": "Seamoss 200g"}, "en": {"name": "Seamoss 200g"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/239BF264-8D07-9C89-4D26-A1C7F7ED5B3B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'seamoss'),
                'seamoss-270g-13648610',
                11.0,
                '{"fr": {"name": "Seamoss 270g"}, "en": {"name": "Seamoss 270g"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/CE195A44-00D1-7A37-BB85-C5BAD94914CA-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'seasoning-small-packets-13648445',
                1.0,
                '{"fr": {"name": "Seasoning small packets"}, "en": {"name": "Seasoning small packets"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/35C673D0-DBA3-D3E3-8D68-B975B72127EB-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'secret-deodorant-13986353',
                8.0,
                '{"fr": {"name": "Secret deodorant"}, "en": {"name": "Secret deodorant"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/1E6E146E-B5E6-F41D-D769-50AFEB88A8C4-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'sesame-street-baby-shampoo-13648606',
                6.0,
                '{"fr": {"name": "Sesame street Baby shampoo"}, "en": {"name": "Sesame street Baby shampoo"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5530A6AF-D7C7-6443-71BB-A6ED73DD8030-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'seven-seas-cod-liver-oil-13648600',
                45.0,
                '{"fr": {"name": "Seven seas cod liver oil"}, "en": {"name": "Seven seas cod liver oil"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/CCB11F32-138F-A0ED-375E-B06E0B27F59D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'seven-seas-cod-liver-oil-13648601',
                22.0,
                '{"fr": {"name": "Seven seas cod liver oil"}, "en": {"name": "Seven seas cod liver oil"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/807D293A-E262-A1EA-B672-A529579C707B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'seven-seas-cod-liver-oil-13648602',
                18.0,
                '{"fr": {"name": "Seven seas cod liver oil"}, "en": {"name": "Seven seas cod liver oil"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/2082F87B-F51E-A405-4EA2-895B54A94545-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'shake-up-14285625',
                3.0,
                '{"fr": {"name": "Shake up"}, "en": {"name": "Shake up"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/21680844-F5A0-1F32-293E-EF20CC60A6AC-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'shandy-13648502',
                3.0,
                '{"fr": {"name": "Shandy"}, "en": {"name": "Shandy"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/05D7AEE4-0103-24FD-35BA-C20F7EA5CDCA-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'shine-n-jam-big-14287225',
                10.0,
                '{"fr": {"name": "Shine n\u2019jam big"}, "en": {"name": "Shine n\u2019jam big"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/6F0DFF64-BDA3-2116-669F-5D455C1FE44D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'shine-n-jam-small-14287227',
                7.0,
                '{"fr": {"name": "Shine n\u2019jam small"}, "en": {"name": "Shine n\u2019jam small"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/C84B7228-B784-6F3A-DFB6-690892C83884-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'shirley-biscuit-13648346',
                2.5,
                '{"fr": {"name": "Shirley biscuit"}, "en": {"name": "Shirley biscuit"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/3184CF1B-4993-7CAC-015A-EC8507A0D4B8-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'shirley-biscuit-snack-13648345',
                6.0,
                '{"fr": {"name": "Shirley biscuit snack"}, "en": {"name": "Shirley biscuit snack"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FF0583E4-C663-4E5B-79A4-8EBA45BFB762-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'shortcake-biscuits-13986369',
                3.0,
                '{"fr": {"name": "Shortcake biscuits"}, "en": {"name": "Shortcake biscuits"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/AAE9D3AE-D480-677F-3660-06F41CF985E0-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'signal-toothbrush-15585386',
                2.2,
                '{"fr": {"name": "Signal toothbrush"}, "en": {"name": "Signal toothbrush"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/6158BD53-4A0A-F03C-CB87-909E802A48E0-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'sirop-de-menthe-13648411',
                6.0,
                '{"fr": {"name": "Sirop de menthe"}, "en": {"name": "Sirop de menthe"}}',
                'https://storage.googleapis.com/f7w-product-images/21916276854421b4e379d944ed6a3617e53c9eb3/5E4D7ADF-9DB8-361E-5BC4-8EF1AAB6A993-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'small-cereal-27094989',
                1.5,
                '{"fr": {"name": "small cereal"}, "en": {"name": "small cereal"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'small-kiss-cake-26440418',
                1.5,
                '{"fr": {"name": "Small kiss cake"}, "en": {"name": "Small kiss cake"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'small-tang-14287839',
                10.0,
                '{"fr": {"name": "Small Tang"}, "en": {"name": "Small Tang"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/0E650E8E-4175-5958-1899-455C1253862A-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'soft-candle-16136877',
                5.0,
                '{"fr": {"name": "Soft candle"}, "en": {"name": "Soft candle"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'solo-soft-drink-28052593',
                1.5,
                '{"fr": {"name": "solo soft drink"}, "en": {"name": "solo soft drink"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/BD39A122-062A-1196-E6CE-2D36ED8732F2-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'spa-body-wash-13648583',
                6.0,
                '{"fr": {"name": "Spa body wash"}, "en": {"name": "Spa body wash"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/281446C1-376E-106F-D952-D3D3F9FD1B3F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'spicy-brown-mustard-13648414',
                6.0,
                '{"fr": {"name": "Spicy brown mustard"}, "en": {"name": "Spicy brown mustard"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/6732C464-2625-DEBE-EAAA-9FE48FB87DAE-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'steak-seasoning-13648462',
                7.0,
                '{"fr": {"name": "Steak seasoning"}, "en": {"name": "Steak seasoning"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/AC989064-5827-3AA8-9DD0-B0FAE39374F7-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'stix-27094978',
                1.0,
                '{"fr": {"name": "stix"}, "en": {"name": "stix"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'strongbow-13648477',
                5.0,
                '{"fr": {"name": "Strongbow"}, "en": {"name": "Strongbow"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/35EEE453-BAD5-C34E-E402-B96044C33F72-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'suave-men-13986347',
                5.0,
                '{"fr": {"name": "Suave men"}, "en": {"name": "Suave men"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5F34319E-F200-4B58-8912-A52FE1F1731E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'suave-men-active-13648598',
                5.0,
                '{"fr": {"name": "Suave men active"}, "en": {"name": "Suave men active"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/1F9756BF-5B93-3A7E-8417-95640CD5D200-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'sunflower-butter-16072886',
                6.0,
                '{"fr": {"name": "sunflower butter"}, "en": {"name": "sunflower butter"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'sunflower-butter-13746379',
                9.0,
                '{"fr": {"name": "Sunflower butter"}, "en": {"name": "Sunflower butter"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/1A3FB5BD-ECEE-2B8C-147A-D73A710FB289-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'sunset-14016444',
                30.0,
                '{"fr": {"name": "Sunset"}, "en": {"name": "Sunset"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'supligen-13648510',
                3.0,
                '{"fr": {"name": "Supligen"}, "en": {"name": "Supligen"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/9845CDA2-D1DE-9514-FB55-484646FDDE5C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'sweet-corn-28052614',
                3.0,
                '{"fr": {"name": "sweet corn"}, "en": {"name": "sweet corn"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/28CD0325-13E5-D971-AC25-6DE1F6EF2B76-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'swiss-bbq-sauce-13648374',
                8.0,
                '{"fr": {"name": "Swiss BBQ sauce"}, "en": {"name": "Swiss BBQ sauce"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/3A25F805-5920-B4D1-82EA-B2D4E1F51FDF-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'swiss-ketchup-13648371',
                6.0,
                '{"fr": {"name": "Swiss ketchup"}, "en": {"name": "Swiss ketchup"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/B0F3B4CB-6802-EEF0-C981-A2999F28D98F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'swiss-ketchup-13648373',
                3.0,
                '{"fr": {"name": "Swiss ketchup"}, "en": {"name": "Swiss ketchup"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/16933C67-1BF6-823E-A61D-C940D609FE30-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'swiss-mayonnaise-13648372',
                5.0,
                '{"fr": {"name": "Swiss mayonnaise"}, "en": {"name": "Swiss mayonnaise"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F7D253D6-88F8-F044-ADD5-144292D477AD-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'swiss-miss-hot-chocolate-13648387',
                2.0,
                '{"fr": {"name": "Swiss miss hot chocolate"}, "en": {"name": "Swiss miss hot chocolate"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/DF997CCA-6FA0-19A8-F9F0-E9E352BCB70E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'tamarind-balls-16275983',
                10.0,
                '{"fr": {"name": "tamarind balls"}, "en": {"name": "tamarind balls"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'tango-13986307',
                3.0,
                '{"fr": {"name": "Tango"}, "en": {"name": "Tango"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/BC119C7E-A1A8-3C6B-989E-A457723C01BC-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'teatime-biscuit-13648351',
                2.5,
                '{"fr": {"name": "Teatime biscuit"}, "en": {"name": "Teatime biscuit"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5FDCAAA9-578E-731D-5972-E49FF374A02E-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'top-brass-13648553',
                12.0,
                '{"fr": {"name": "Top brass"}, "en": {"name": "Top brass"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/66A7BB08-39EE-84E7-0FBB-80FF349A92C6-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'tree-hut-bodywash-13648534',
                18.0,
                '{"fr": {"name": "Tree hut bodywash"}, "en": {"name": "Tree hut bodywash"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/12DD6631-BA6F-1D96-CDF6-4BF95A80ADCC-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'tree-hut-sugar-scrub-13648533',
                19.0,
                '{"fr": {"name": "Tree hut sugar scrub"}, "en": {"name": "Tree hut sugar scrub"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/007C167C-CAA0-B894-F2BD-434DF6F111C8-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'tumaric-15792827',
                6.0,
                '{"fr": {"name": "Tumaric"}, "en": {"name": "Tumaric"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/1E8E8776-A77A-7F6A-4891-F25A4A860ACC-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'tuna-13648385',
                4.0,
                '{"fr": {"name": "Tuna"}, "en": {"name": "Tuna"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/FE7B3412-F8C1-34B3-64B3-90E7D8A35137-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'turbo-juice-16136880',
                2.5,
                '{"fr": {"name": "Turbo juice"}, "en": {"name": "Turbo juice"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'turmeric-ball-pack-16136885',
                10.0,
                '{"fr": {"name": "Turmeric ball Pack"}, "en": {"name": "Turmeric ball Pack"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'turpentin-cleaner-13648594',
                13.0,
                '{"fr": {"name": "Turpentin cleaner"}, "en": {"name": "Turpentin cleaner"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'unic-perfume-14287477',
                60.0,
                '{"fr": {"name": "Unic Perfume"}, "en": {"name": "Unic Perfume"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5FF4F154-DA56-F115-ECF8-C1F57F22D440-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'urban-eau-de-parfum-13648567',
                60.0,
                '{"fr": {"name": "Urban Eau de parfum"}, "en": {"name": "Urban Eau de parfum"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'vanilla-cookies-26414474',
                3.0,
                '{"fr": {"name": "Vanilla cookies"}, "en": {"name": "Vanilla cookies"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/29C89CB5-E5A5-A624-DB9D-B7A3CAA06689-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'assaisonnement'),
                'vanilla-essence-13648455',
                18.0,
                '{"fr": {"name": "Vanilla essence"}, "en": {"name": "Vanilla essence"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/AA996922-45D4-425C-6E34-D7F148AF802F-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'variety-pack-14286182',
                20.0,
                '{"fr": {"name": "Variety pack"}, "en": {"name": "Variety pack"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/786A6CEA-9751-21BD-1F92-D9C07AED5EA0-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'vaseline-13648539',
                15.0,
                '{"fr": {"name": "Vaseline"}, "en": {"name": "Vaseline"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F1EDE193-4844-71D2-5E56-E8FC9BE6851B-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'vaseline-13648541',
                9.0,
                '{"fr": {"name": "Vaseline"}, "en": {"name": "Vaseline"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/165DE3E5-C7FC-9BA7-3EA8-E4F8B109A012-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'vaseline-13648540',
                4.5,
                '{"fr": {"name": "Vaseline"}, "en": {"name": "Vaseline"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/180ECB66-ED46-EBCC-5EB6-D289BC817A15-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'vaseline-body-oil-15076610',
                13.0,
                '{"fr": {"name": "Vaseline Body Oil"}, "en": {"name": "Vaseline Body Oil"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/D2E0C8F4-066D-1D32-94CD-BB623AB9E7D3-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'vaseline-cocoa-cream-13648542',
                15.0,
                '{"fr": {"name": "Vaseline cocoa cream"}, "en": {"name": "Vaseline cocoa cream"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/A0D2FB39-1158-41AF-4B27-7B6F8E15A70C-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'vaseline-cream-13648538',
                15.0,
                '{"fr": {"name": "Vaseline cream"}, "en": {"name": "Vaseline cream"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/97945672-6788-4E11-1EA1-58606C061FD2-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-sans-alcool'),
                'vimto-juice-28052604',
                3.0,
                '{"fr": {"name": "vimto juice"}, "en": {"name": "vimto juice"}}',
                'https://storage.googleapis.com/f7w-product-images/80772/EDBB4D6C-871C-C7CF-71F8-CBA55D1A5A24-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'vita-malt-16136891',
                2.5,
                '{"fr": {"name": "Vita malt"}, "en": {"name": "Vita malt"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'wheat-crackers-16275980',
                2.5,
                '{"fr": {"name": "wheat crackers"}, "en": {"name": "wheat crackers"}}',
                '',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'whisky-jb-13648494',
                35.0,
                '{"fr": {"name": "Whisky JB"}, "en": {"name": "Whisky JB"}}',
                'https://storage.googleapis.com/f7w-product-images/2ae8e7e3e2a2c2cc9e8bd8a38a470a275e5684ce/45E7A2CF-03D4-8F37-8C43-4B0E275E37A6-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'white-diamond-14287331',
                25.0,
                '{"fr": {"name": "White Diamond"}, "en": {"name": "White Diamond"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/12047D29-4F0D-E00F-9D72-18E266573363-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'white-lavender-30ml-13648587',
                10.0,
                '{"fr": {"name": "White lavender 30ml"}, "en": {"name": "White lavender 30ml"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/1E0073A3-7281-55A1-CD13-BC0A11BB9CA4-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'whiti-diamond-red-set-14287431',
                60.0,
                '{"fr": {"name": "Whiti Diamond Red set"}, "en": {"name": "Whiti Diamond Red set"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/F0AE7676-6DCF-D1B2-858F-E6311CB14FB3-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'william-lawson-13648488',
                25.0,
                '{"fr": {"name": "William lawson"}, "en": {"name": "William lawson"}}',
                'https://storage.googleapis.com/f7w-product-images/0b054958c00ec30a7580fd883deb4f603c51858a/202561C0-A763-434C-156F-ED6E91332779-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'boissons-alcoolisees'),
                'william-lawson-13648504',
                45.0,
                '{"fr": {"name": "William lawson"}, "en": {"name": "William lawson"}}',
                'https://storage.googleapis.com/f7w-product-images/b3d2072c201daa6c37b497670d8ad999e99683af/78FA4BDB-D428-D214-77A8-9E79E5C1815D-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'xtreme-gel-clear-14287528',
                2.0,
                '{"fr": {"name": "Xtreme Gel Clear"}, "en": {"name": "Xtreme Gel Clear"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/B5CA1F59-689B-BAB3-1985-561710BD9347-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'alimentaire'),
                'yellow-mustard-13648376',
                8.0,
                '{"fr": {"name": "Yellow mustard"}, "en": {"name": "Yellow mustard"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/5C6C856C-4B25-1FDC-4B73-A9DCA22356C5-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            

            INSERT INTO products (category_id, slug, price, translations, image_url, low_stock_threshold, stock, is_active)
            VALUES (
                (SELECT id FROM categories WHERE slug = 'divers'),
                'z3-viva-la-belle-14287484',
                25.0,
                '{"fr": {"name": "Z3 Viva La Belle"}, "en": {"name": "Z3 Viva La Belle"}}',
                'https://storage.googleapis.com/f7w-product-images/caa37b538a9884abc4fa24f007b241eacb15eef9/3F9745B7-41DD-2564-AB0F-6226665A1938-ORIGINAL.jpg',
                0,
                0, -- Stock par défaut à 0 car non fourni dans le CSV (sauf le seuil)
                true
            ) ON CONFLICT (slug) DO NOTHING;
            
COMMIT;