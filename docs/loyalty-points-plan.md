# Plan : Système de points de fidélité

## Objectif
Encourager les clients à commander en cumulant des points en fonction de leurs dépenses. Les points peuvent être échangés contre des bons de réduction (paliers configurables par l'admin). Le client choisit librement de cumuler ou d'échanger ses points à tout moment.

## Règles métier

- **Taux de conversion** : 1€ dépensé = 1 point
- **Base de calcul** : sous-total des produits de la commande (pas de frais de livraison, l'activité étant uniquement en click & collect)
- **Expiration** : aucune pour l'instant (les points ne périment pas)
- **Échange** : libre, à tout moment, dès que le solde couvre le coût en points d'une récompense
- **Paliers de réduction** : entièrement gérés par l'admin depuis le dashboard (catalogue de récompenses configurable, pas de valeurs codées en dur)

## 1. Modèle de données (migration Supabase)

Nouvelle migration SQL dans `supabase/migrations/`.

- `profiles.loyalty_points_balance` (int, default 0) — solde courant du client
- `loyalty_ledger` — historique des mouvements de points
  - `id, user_id, order_id (nullable), type (earn|redeem|adjustment), points, balance_after, description, created_at`
- `loyalty_rewards` — catalogue des paliers de réduction, **créés et gérés par l'admin dans le dashboard**
  - `id, name, points_cost, discount_type (percentage|fixed), discount_value, is_active, created_at, updated_at`
- `loyalty_redemptions` — historique des échanges effectués par les clients
  - `id, user_id, reward_id, coupon_id, points_spent, created_at`

RLS :
- Client : lecture seule de son propre solde/historique (`user_id = auth.uid()`)
- Écritures sur `loyalty_ledger` / débit-crédit uniquement via service role (webhook ou RPC sécurisée)
- `loyalty_rewards` : lecture publique des récompenses actives, écriture réservée à l'admin (`is_admin()`)

## 2. Acquisition des points

- Modifier `src/app/api/payments/webhook/route.ts` : quand `payment_status` passe à `paid`
  - Calculer `points = floor(order.subtotal)`
  - Créditer `profiles.loyalty_points_balance` via une fonction Postgres (RPC) atomique pour éviter les races
  - Insérer une ligne `earn` dans `loyalty_ledger`
- Gérer les remboursements (`refunded` / `partially_refunded`) : reprendre les points via une ligne `adjustment` négative (borner à 0)

## 3. Échange de points contre récompenses

- `GET /api/loyalty` : renvoie solde, historique, catalogue des récompenses actives
- `POST /api/loyalty/redeem` :
  - Reçoit `reward_id`
  - Vérifie que le solde du client couvre `points_cost`
  - Décrémente le solde de façon atomique (RPC)
  - Génère un coupon dans la table `coupons` existante (code unique auto-généré, `discount_type`/`discount_value` copiés depuis la récompense, `usage_limit: 1`, `is_active: true`, réservé au client via une contrainte ou vérification côté validation)
  - Insère une ligne dans `loyalty_redemptions`
- Le coupon généré est ensuite utilisable normalement via le flux existant `validate-coupon` au checkout

## 4. Interface Admin (dashboard) — gestion des paliers

Nouvelle section `/admin/loyalty` (même pattern que `CouponForm.tsx` / `ReductionForm.tsx`) :

- **CRUD du catalogue `loyalty_rewards`** : c'est ici que l'admin définit les paliers de réduction en fonction du nombre de points (ex: 500 points → 5€, 1000 points → 12€, etc.)
  - Formulaire : nom du palier, coût en points, type de réduction (% ou montant fixe), valeur, actif/inactif
  - Liste/tableau des paliers existants avec activation/désactivation et suppression
- **Vue d'ensemble** : soldes de points par client, historique des échanges (`loyalty_redemptions`), total de points en circulation
- **Configuration du taux de conversion** : champ éditable (valeur par défaut 1€ = 1 point) stocké dans `store_settings` ou une table de config dédiée, pour permettre un ajustement futur sans redéploiement

## 5. Interface client

- Section `/account/loyalty` (ou intégrée à `/account`) :
  - Solde de points bien visible
  - Catalogue des paliers disponibles (définis par l'admin) avec bouton "Échanger" (désactivé si solde insuffisant)
  - Historique des gains/échanges
  - Liste des bons de réduction obtenus, utilisés ou non

## 6. Incitation à commander

- Affichage du solde de points dans le header ou la page compte
- Sur le panier/checkout : "Vous avez X points, encore Y points pour débloquer [nom du palier]"

## Ordre d'implémentation recommandé

1. Migration SQL (tables + RLS)
2. Fonctions RPC Postgres pour crédit/débit atomique des points
3. Intégration dans le webhook Stripe (acquisition des points)
4. API `/api/loyalty` (lecture) et `/api/loyalty/redeem` (échange)
5. Interface admin `/admin/loyalty` (gestion des paliers de réduction)
6. Interface client `/account/loyalty`
7. Éléments d'incitation (header, panier, checkout)
