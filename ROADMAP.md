# 🛒 Lucian Connection - Roadmap

> Épicerie caribéenne en ligne | Next.js 14 + Supabase + Tailwind  
> **Langues:** Français (défaut) / English  
> **Couleurs:** Sainte-Lucie (Bleu #0070FF / Jaune #FCD116 / Noir / Blanc)

---

## Phase 1 : Initialisation & Design System

- [ ] Initialiser le projet Next.js 14 (App Router) + TypeScript + Tailwind CSS
- [ ] Installer et configurer `next-intl` pour l'internationalisation (FR/EN)
- [ ] Créer la structure `app/[locale]/` avec middleware de détection de langue
- [ ] Configurer `tailwind.config.ts` avec la palette Sainte-Lucie
- [ ] Créer les fichiers de traduction `messages/fr.json` et `messages/en.json`
- [ ] Mettre en place les composants Layout (Header, Footer, AdminSidebar)
- [ ] Créer les composants UI de base (Button, Input, Card, Badge, Modal)
- [ ] Implémenter le `LanguageSwitcher` component

---

## Phase 2 : Backend Supabase

- [ ] Créer le projet Supabase
- [ ] Définir le schéma de la BDD :
  - [ ] `categories` (id, slug, image_url, display_order, **translations JSONB**)
  - [ ] `products` (id, slug, price, category_id, image_url, **translations JSONB**, **stock**, **low_stock_threshold**, track_stock, unit, is_featured, is_active)
  - [ ] `profiles` (id, full_name, phone, address, role)
  - [ ] `orders` (id, user_id, status, subtotal, delivery_fee, total_amount, delivery_address, phone, notes, **locale**)
  - [ ] `order_items` (id, order_id, product_id, product_name, quantity, unit_price, total_price)
- [ ] Créer le trigger `decrement_stock()` pour décrémentation automatique
- [ ] Configurer les politiques RLS (Admin vs Customer)
- [ ] Configurer Supabase Storage pour les images produits
- [ ] Générer les types TypeScript avec `supabase gen types`

---

## Phase 3 : Dashboard Admin

- [ ] Créer la route protégée `/admin` avec layout sidebar
- [ ] **Dashboard principal** : Stats (commandes du jour, revenus, alertes stock)
- [ ] **Gestion Produits** :
  - [ ] Liste des produits avec recherche/filtres
  - [ ] Formulaire ajout/édition avec champs multilingues (FR/EN)
  - [ ] Upload d'image vers Supabase Storage
- [ ] **Gestion Catégories** : CRUD avec traductions
- [ ] **Gestion Stocks** :
  - [ ] Tableau d'inventaire avec indicateurs visuels (stock bas en rouge)
  - [ ] Modification inline du stock
  - [ ] Filtres : tous / stock bas / rupture
- [ ] **Gestion Commandes** :
  - [ ] Liste des commandes avec statuts
  - [ ] Détail commande avec produits
  - [ ] Changement de statut (pending → confirmed → preparing → ready → delivered)

---

## Phase 4 : Storefront Client

- [ ] **Homepage** (`/[locale]/`) :
  - [ ] Hero Banner avec CTA "Shop now"
  - [ ] Navigation catégories (horizontal scroll)
  - [ ] Section "You might need" (produits featured)
- [ ] **Catalogue** (`/[locale]/products`) :
  - [ ] Grille de produits responsive
  - [ ] Filtres par catégorie
  - [ ] Gestion produits indisponibles (stock = 0)
- [ ] **Fiche Produit** (`/[locale]/products/[slug]`) :
  - [ ] Images, description multilingue, prix
  - [ ] Sélecteur quantité + Ajout au panier
- [ ] **Panier** :
  - [ ] CartDrawer (slide-out panel)
  - [ ] State management avec Zustand + localStorage persistence
  - [ ] Mise à jour quantités / suppression
- [ ] **Checkout** (`/[locale]/checkout`) :
  - [ ] Formulaire adresse de livraison
  - [ ] Récapitulatif commande
  - [ ] Confirmation commande (sans paiement en ligne pour l'instant)
- [ ] **Authentification** :
  - [ ] Login / Register avec Supabase Auth
  - [ ] Page "Mes commandes" pour les utilisateurs connectés

---

## Phase 5 : Finalisation & Déploiement

- [ ] Tests des flux complets (commande client → réception admin → mise à jour stock)
- [ ] Optimisation images (next/image, formats modernes)
- [ ] SEO : meta tags, hreflang, sitemap, robots.txt
- [ ] Déploiement Vercel avec variables d'environnement Supabase
- [ ] Tests responsive (mobile, tablet, desktop)

---

## Phase 6 (Future) : Paiement en ligne

- [ ] Intégration Stripe
- [ ] Webhooks de confirmation de paiement
- [ ] Factures PDF

---

## 📋 Notes techniques

### Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (SSR)
- **Storage:** Supabase Storage
- **i18n:** next-intl
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **Deployment:** Vercel

### Couleurs Sainte-Lucie (Tailwind)
```js
primary: { 500: '#0070FF', ... }  // Bleu céruléen
accent: { 400: '#FCD116', ... }   // Jaune/Or
```

### Structure i18n
```
app/[locale]/        → Pages client (FR/EN)
app/admin/           → Dashboard admin (FR uniquement)
messages/fr.json     → Traductions françaises
messages/en.json     → Traductions anglaises
```

---

## 🎨 Design System JSON

```json
{
  "designSystem": {
    "name": "Lucian Connection Design System",
    "version": "1.0.0",
    "colors": {
      "primary": {
        "50": "#e6f2ff",
        "100": "#b3d9ff",
        "200": "#80bfff",
        "300": "#4da6ff",
        "400": "#1a8cff",
        "500": "#0070FF",
        "600": "#0059cc",
        "700": "#004299",
        "800": "#002c66",
        "900": "#001533"
      },
      "accent": {
        "50": "#fffbeb",
        "100": "#fef3c7",
        "200": "#fde68a",
        "300": "#fcd34d",
        "400": "#FCD116",
        "500": "#eab308",
        "600": "#ca8a04",
        "700": "#a16207"
      }
    },
    "typography": {
      "fontFamily": {
        "primary": "Inter, sans-serif",
        "display": "Poppins, sans-serif"
      }
    },
    "borderRadius": {
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px",
      "2xl": "24px",
      "full": "9999px"
    },
    "components": {
      "header": {
        "height": "72px",
        "background": "primary.700"
      },
      "productCard": {
        "borderRadius": "xl",
        "shadow": "0 2px 8px rgba(0,0,0,0.08)"
      },
      "button": {
        "primary": { "bg": "primary.500", "hover": "primary.600" },
        "accent": { "bg": "accent.400", "hover": "accent.500" }
      }
    }
  }
}
```