import type { AuditChange } from "@/types/database.types";

/**
 * Catalogue of every audit action recorded in the admin dashboard, with a
 * human-readable French label used by the activity log UI. Keeping this in
 * one place avoids drifting labels between call sites.
 *
 * This module has no server-only dependencies (unlike `@/lib/audit`) so it
 * can be safely imported from both server code and "use client" components.
 */
export const AUDIT_ACTIONS = {
  "product.created": "Produit créé",
  "product.updated": "Produit modifié",
  "product.deleted": "Produit supprimé",
  "product.stock_adjusted": "Stock ajusté",
  "product.featured_toggled": "Mise en avant modifiée",
  "category.created": "Catégorie créée",
  "category.updated": "Catégorie modifiée",
  "category.deleted": "Catégorie supprimée",
  "coupon.created": "Coupon créé",
  "coupon.updated": "Coupon modifié",
  "coupon.deleted": "Coupon supprimé",
  "reduction.created": "Réduction créée",
  "reduction.updated": "Réduction modifiée",
  "reduction.deleted": "Réduction supprimée",
  "order.status_changed": "Statut de commande modifié",
  "order.refunded": "Commande remboursée",
  "order.pickup_recorded": "Retrait enregistré",
  "order.age_verified": "Vérification d'âge effectuée",
  "store_settings.updated": "Paramètres du magasin modifiés",
  "pickup_opening_hours.updated": "Horaires de retrait modifiés",
  "pickup_closure.created": "Fermeture ajoutée",
  "pickup_closure.deleted": "Fermeture supprimée",
  "loyalty_reward.created": "Récompense fidélité créée",
  "loyalty_reward.updated": "Récompense fidélité modifiée",
  "loyalty_reward.deleted": "Récompense fidélité supprimée",
  "user.invited": "Utilisateur invité",
  "user.deleted": "Utilisateur supprimé",
  "user.role_changed": "Rôle utilisateur modifié",
  "auth.login": "Connexion au dashboard",
  "auth.password_set": "Mot de passe défini",
} as const;

export type AuditAction = keyof typeof AUDIT_ACTIONS;

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || a === undefined) return b === null || b === undefined;
  if (b === null || b === undefined) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/**
 * Compare a chosen set of fields between two versions of a record and
 * return only the ones that changed, formatted for `audit_logs.changes`.
 */
export function diffFields<T extends Record<string, unknown>>(
  before: T | null | undefined,
  after: T | null | undefined,
  fields: ReadonlyArray<keyof T & string>
): AuditChange[] {
  if (!before || !after) return [];

  const changes: AuditChange[] = [];
  for (const field of fields) {
    const oldValue = before[field];
    const newValue = after[field];
    if (!valuesEqual(oldValue, newValue)) {
      changes.push({ field, old: oldValue ?? null, new: newValue ?? null });
    }
  }
  return changes;
}
