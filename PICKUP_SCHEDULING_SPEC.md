# Spécification - Créneaux de retrait

Ce document est le point de reprise pour l'implémentation du choix de créneau de retrait (Click & Collect).

## Objectif

Avant de confirmer une commande, le client doit choisir obligatoirement un créneau de retrait. L'administration doit pouvoir voir ce créneau et le reprogrammer. Le paiement en ligne est hors périmètre et sera traité dans une phase ultérieure.

## Décisions validées

| Sujet | Décision |
| --- | --- |
| Fuseau horaire de référence | `America/Martinique` |
| Jours d'ouverture | Configurables par jour depuis l'administration |
| Horaires de retrait | Configurables par jour depuis l'administration, créneau de fin inclus |
| Intervalle | Toutes les 30 minutes |
| Délai minimal | 30 minutes à partir de l'heure serveur |
| Fenêtre de réservation | Aujourd'hui et les 6 jours locaux suivants (7 jours au total) |
| Capacité par créneau | Illimitée pour la première version |
| Fermetures exceptionnelles | Journées complètes, gérées par les administrateurs |
| Fermeture avec commandes prévues | Refusée tant que les commandes concernées ne sont pas reprogrammées ou annulées |
| Reprogrammation admin | Soumise aux mêmes jours, horaires, intervalle et délai minimal que le client |
| Notification lors d'une reprogrammation | Aucune pour le moment; le client voit le nouveau créneau dans son compte |
| Paiement | Aucun paiement en ligne dans ce périmètre |

## Règles de disponibilité

La disponibilité doit être calculée côté serveur. Le navigateur ne doit jamais être la source de vérité pour l'heure, le fuseau horaire ou la validité d'un créneau.

1. Les dates proposées correspondent aux 7 prochains jours calendaires dans `America/Martinique`, aujourd'hui inclus.
2. Les jours fermés dans la configuration hebdomadaire sont visibles mais non sélectionnables.
3. Une date inscrite dans les fermetures exceptionnelles est visible mais non sélectionnable.
4. Les créneaux ouverts sont `09:00`, `09:30`, ..., `17:30`, `18:00`.
5. Un créneau doit commencer au moins 30 minutes après l'heure serveur.
6. Aucun plafond de commandes ne s'applique à un même créneau pour cette version.
7. Un créneau déjà affiché peut devenir invalide entre l'affichage et l'envoi de la commande. L'API doit donc toujours le recalculer et le revalider à la soumission.

Exemples de limites :

- À `08:30:00`, le créneau de `09:00` est autorisé.
- À `08:30:01`, le créneau de `09:00` n'est plus autorisé.
- À `17:30:00`, le créneau de `18:00` est autorisé.
- Après le dernier créneau valide de la journée, aucun créneau du jour n'est proposé.

## Expérience client

Le checkout actif est `src/app/[locale]/checkout/page.tsx` et crée aujourd'hui une commande sans paiement via `POST /api/orders`.

À ajouter :

1. Un bloc « Retrait » entre les coordonnées et les notes de commande.
2. Un sélecteur composé de 7 boutons de date et d'une grille de boutons horaires, plutôt qu'un champ natif `datetime-local`.
3. Les dates fermées, les week-ends et les jours sans créneau restant sont désactivés et explicitement indiqués.
4. La confirmation est bloquée tant qu'aucun créneau n'est sélectionné.
5. En cas de réponse `PICKUP_SLOT_UNAVAILABLE`, le sélecteur recharge les disponibilités, efface le choix obsolète et affiche une erreur compréhensible.
6. La page de succès affiche le créneau confirmé avant que le panier ne soit vidé.
7. La page `src/app/[locale]/account/page.tsx` affiche le créneau de retrait dans chaque commande, y compris après une modification par l'administration.

Le choix n'a pas besoin d'être ajouté au store Zustand du panier : il est propre au checkout. Il peut être conservé dans l'état local de la page jusqu'à la création de la commande.

## Expérience administration

La page active de gestion des commandes est `src/app/admin/orders/page.tsx`. Le composant `src/components/admin/OrdersTable.tsx` contient un ancien flux non utilisé par cette page; il ne doit pas être la seule cible des modifications.

À ajouter dans la gestion des commandes :

1. Une colonne « Retrait prévu » dans la liste, distincte de la date de création.
2. Un affichage « Non planifié » pour les commandes historiques sans `pickup_at`.
3. Le créneau dans la modale de détail.
4. Une action de reprogrammation qui réutilise le même sélecteur de disponibilité que le checkout.
5. Une sauvegarde distincte de la modification de statut, afin qu'un changement de statut ne revalide pas inutilement un créneau existant.
6. Une mise à jour immédiate de la ligne et de la modale après succès.
7. Le filtre de date actuellement inactif peut filtrer sur la date de retrait, et non plus sur la date de création.
8. Le listing API doit être trié par `pickup_at` croissant, avec les commandes non planifiées après les commandes planifiées si le comportement de PostgreSQL le permet explicitement.

À ajouter dans les paramètres d'administration, de préférence dans `src/components/admin/AdminSettingsForm.tsx` :

1. Une carte « Fermetures exceptionnelles ».
2. Un champ date obligatoire et un motif interne facultatif.
3. Une liste des fermetures futures avec une action de suppression.
4. La création d'une fermeture doit refuser une date passée, un week-end et une date déjà fermée.
5. La création doit renvoyer `409` si des commandes non terminales ont déjà un retrait à cette date locale.

Les statuts considérés comme concernés par cette protection sont `pending`, `confirmed`, `preparing` et `ready`. Les commandes `delivered`, `cancelled` et `refunded` ne doivent pas bloquer la fermeture.

## Modèle de données

Créer une migration versionnée, même si le répertoire `supabase/` n'est plus présent dans la branche actuelle. Les anciens scripts Supabase ont été supprimés dans l'historique; il faut donc vérifier le schéma et les politiques réellement déployés avant d'exécuter la migration.

### Table `orders`

Ajouter :

```sql
pickup_at timestamptz
```

Principes :

- `pickup_at` représente un instant sans ambiguïté, jamais une chaîne locale provenant du navigateur.
- Ajouter un index partiel sur `pickup_at` pour les listes et conflits de fermeture.
- La migration initiale doit tolérer `NULL` afin de préserver les commandes historiques.
- Les nouvelles insertions doivent toutefois obligatoirement contenir un créneau valide, via la validation API et la protection base de données décrite plus bas.

### Table `pickup_closures`

Créer une table dédiée aux fermetures de journée entière :

```text
id          uuid, clé primaire
closed_on   date, unique, non null
reason      text, nullable, note interne non sensible
created_by  uuid, référence vers profiles, nullable
created_at  timestamptz, non null
```

`closed_on` est une date locale en Martinique, non un timestamp. Les fermetures futures peuvent être créées au-delà de la fenêtre de réservation de 7 jours pour préparer les jours fériés.

### Types TypeScript

Mettre à jour `src/types/database.types.ts` avec `Order.pickup_at: string | null` et le type de `pickup_closures` dans `Database`.

Attention : ce fichier est actuellement encodé en UTF-16LE avec fins de ligne CRLF. Le modifier en préservant cet encodage, ou le convertir volontairement et proprement en UTF-8 dans un changement séparé.

## Protection côté base de données

La validation dans une route API ne suffit pas : les clients authentifiés disposent actuellement d'une politique d'insertion directe sur `orders`. Une règle base de données doit empêcher un client de contourner l'interface.

Prévoir une fonction et un trigger `BEFORE INSERT OR UPDATE OF pickup_at` qui :

1. refuse un `pickup_at` nul à la création d'une nouvelle commande;
2. convertit `pickup_at` dans `America/Martinique`;
3. vérifie le lundi-vendredi, l'horaire `09:00` à `18:00` inclus et les minutes `00` ou `30`;
4. vérifie le délai minimal de 30 minutes avec `now()` côté PostgreSQL;
5. vérifie que la date locale est comprise dans la fenêtre des 7 jours;
6. refuse une date présente dans `pickup_closures`;
7. ne s'exécute pas lors d'une simple mise à jour de statut.

Les politiques RLS de `pickup_closures` doivent permettre la gestion par les administrateurs. L'endpoint de disponibilité ne doit exposer que les disponibilités calculées, jamais les notes internes de fermeture. Vérifier les politiques réellement déployées avant de les compléter, car les scripts historiques ont connu plusieurs variantes.

## Contrats API proposés

### `GET /api/pickup-availability`

Endpoint sans cache (`Cache-Control: no-store`) qui calcule les disponibilités à partir de l'heure serveur et des fermetures.

Réponse proposée :

```json
{
  "timeZone": "America/Martinique",
  "generatedAt": "2026-09-01T12:00:00.000Z",
  "days": [
    {
      "date": "2026-09-01",
      "state": "available",
      "slots": [
        { "time": "09:00", "pickupAt": "2026-09-01T13:00:00.000Z" },
        { "time": "09:30", "pickupAt": "2026-09-01T13:30:00.000Z" }
      ]
    },
    {
      "date": "2026-09-06",
      "state": "weekend",
      "slots": []
    }
  ]
}
```

Le client renvoie l'instant `pickupAt` sélectionné. L'API serveur confirme qu'il appartient encore aux créneaux proposés au moment de la requête. Il ne faut pas interpréter un `datetime-local` selon le fuseau du navigateur.

### `POST /api/orders`

Étendre le payload existant avec :

```json
{
  "pickup_at": "2026-09-01T13:00:00.000Z"
}
```

Avant l'insertion, la route doit vérifier que la valeur est un instant ISO valide et fait toujours partie de la disponibilité serveur. En cas d'échec, répondre en `400` avec un code stable :

```json
{ "error": "PICKUP_SLOT_UNAVAILABLE" }
```

Ajouter l'instant validé à `orderData` avant l'insertion. Les contrôles existants du checkout ne remplacent pas cette validation côté serveur.

### `PATCH /api/admin/orders/[id]/pickup`

Créer une route dédiée à la reprogrammation :

```json
{
  "pickup_at": "2026-09-01T13:00:00.000Z"
}
```

Elle doit réutiliser exactement la même validation de disponibilité que `POST /api/orders`, exiger l'authentification administrateur avec `getAdminSupabase`, puis renvoyer la commande mise à jour. La route existante `PATCH /api/admin/orders/[id]` reste réservée au statut.

### Gestion des fermetures

Créer les routes protégées suivantes :

```text
GET    /api/admin/pickup-closures
POST   /api/admin/pickup-closures
DELETE /api/admin/pickup-closures/[id]
```

Payload de création :

```json
{
  "closed_on": "2026-09-15",
  "reason": "Jour férié"
}
```

Avant création, l'API vérifie le format, le caractère futur, le jour ouvré, l'unicité et l'absence de commande non terminale planifiée ce jour-là dans le fuseau `America/Martinique`.

## Architecture recommandée

Créer `src/lib/pickup-rules.ts` comme source unique des constantes et règles de disponibilité :

```text
PICKUP_TIME_ZONE = America/Martinique
PICKUP_LEAD_MINUTES = 30
PICKUP_BOOKING_DAYS = 7
PICKUP_WEEKDAYS = lundi à vendredi
PICKUP_START = 09:00
PICKUP_END = 18:00
PICKUP_INTERVAL_MINUTES = 30
```

Ce module doit être appelé par les routes de disponibilité, de création de commande et de reprogrammation. Les affichages utilisent `Intl.DateTimeFormat` avec `timeZone: "America/Martinique"` explicitement.

Créer un composant client réutilisable, par exemple `src/components/pickup/PickupSlotPicker.tsx`, pour le checkout et la modale admin. Il doit proposer de grands boutons tactiles, des états de chargement et d'erreur, ainsi que les attributs d'accessibilité nécessaires (`aria-pressed`, libellés explicites).

Ne pas ajouter de bibliothèque de calendrier pour ce besoin limité. Ne pas créer de table de capacité ou de créneaux à ce stade.

## Fichiers principaux à modifier

| Fichier | Changement attendu |
| --- | --- |
| `supabase/migrations/...` | Migration `pickup_at`, `pickup_closures`, index, RLS et trigger de validation |
| `src/lib/pickup-rules.ts` | Calcul et validation centralisés des créneaux |
| `src/components/pickup/PickupSlotPicker.tsx` | Sélecteur réutilisable date/heure |
| `src/app/api/pickup-availability/route.ts` | Disponibilités calculées sans cache |
| `src/app/api/orders/route.ts` | Réception, validation et persistance de `pickup_at` |
| `src/app/api/admin/orders/[id]/pickup/route.ts` | Reprogrammation sécurisée par un admin |
| `src/app/api/admin/pickup-closures/route.ts` | Liste et création des fermetures |
| `src/app/api/admin/pickup-closures/[id]/route.ts` | Suppression d'une fermeture |
| `src/app/[locale]/checkout/page.tsx` | Sélection obligatoire et affichage du retrait confirmé |
| `src/app/[locale]/account/page.tsx` | Affichage du retrait dans l'historique client |
| `src/app/admin/orders/page.tsx` | Colonne, détail et reprogrammation admin |
| `src/components/admin/AdminSettingsForm.tsx` | Gestion des fermetures exceptionnelles |
| `src/types/database.types.ts` | Types de la nouvelle colonne et table |
| `src/messages/fr.json` et `src/messages/en.json` | Libellés, états fermés, erreurs et confirmation |
| `src/components/layout/Header.tsx` | Mettre à jour la promesse actuelle de retrait en 15 min si elle reste affichée |

## Points existants à corriger ou à préserver

- Le checkout affiche actuellement « Paiement à la livraison ». Aucun paiement en ligne ne doit être ajouté dans cette phase.
- Le message marketing actuel mentionne 15 minutes dans les traductions et le header; il doit devenir cohérent avec le délai minimal de 30 minutes ou être reformulé.
- L'API admin des commandes sélectionne déjà `orders.*`; la nouvelle colonne sera automatiquement renvoyée après migration.
- La route admin `PATCH /api/admin/orders/[id]` n'accepte aujourd'hui que `status`; elle ne doit pas accepter silencieusement un changement de créneau.
- La recherche et le filtre de statut de l'administration sont actuellement côté client. Le champ date affiché n'a pas encore de comportement.
- Les commandes et items sont actuellement insérés en deux requêtes non transactionnelles. Ce risque est hors périmètre direct, mais il doit être connu si le flux de commande est refactorisé.
- La validation client actuelle ne suffit pas pour les montants, coupons, stock ou créneaux. Le nouveau contrôle des créneaux doit impérativement être effectué côté serveur et base de données.

## Tests et vérification

Le projet ne contient actuellement ni script `test` ni configuration de tests. Ajouter une base de tests ou documenter une recette manuelle avant livraison.

Tests fonctionnels minimaux :

1. Un lundi ouvré affiche les créneaux de 09:00 à 18:00 par pas de 30 minutes.
2. Un samedi, un dimanche et une fermeture exceptionnelle n'affichent aucun créneau sélectionnable.
3. Les créneaux avant `now + 30 minutes` sont exclus, y compris les cas limites à la seconde près.
4. Le checkout ne peut pas être soumis sans créneau.
5. Une tentative directe d'appel API avec un créneau invalide, passé, hors fenêtre, hors horaire ou fermé est refusée.
6. Une commande avec un créneau valide enregistre le bon `pickup_at` et l'affiche dans le compte et l'administration.
7. Un admin peut reprogrammer vers un créneau valide; un créneau invalide est refusé.
8. Une fermeture avec des commandes `pending`, `confirmed`, `preparing` ou `ready` est refusée avec `409`.
9. Une fermeture sans commande concernée est créée, disparaît des disponibilités, puis peut être supprimée.
10. Les dates et heures affichées restent en heure Martinique quel que soit le fuseau du navigateur.
11. Vérifier `npm run lint` et `npm run build` après l'implémentation.

## Séquencement de livraison

1. Inspecter le schéma, les triggers et les politiques RLS réels dans Supabase avant toute migration, car les migrations ne sont pas actuellement versionnées dans la branche.
2. Ajouter la migration de données, les index, les protections RLS et le trigger de validation.
3. Mettre à jour les types TypeScript et créer le module central de règles.
4. Implémenter les endpoints de disponibilité, fermetures, création et reprogrammation.
5. Implémenter le sélecteur réutilisable, puis l'intégrer au checkout et à la modale admin.
6. Ajouter l'affichage client, les traductions et la gestion des fermetures dans les paramètres admin.
7. Tester les cas limites, puis déployer la migration avant le code qui dépend de la nouvelle colonne.
8. Les commandes historiques sans créneau restent affichées comme « Non planifié » jusqu'à leur traitement manuel. Une contrainte `NOT NULL` globale ne doit être ajoutée qu'après avoir traité ces données ou si le trigger protège déjà toutes les nouvelles insertions.
