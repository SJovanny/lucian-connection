"use client";

import { Fragment, useCallback, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { AUDIT_ACTIONS } from "@/lib/audit-shared";
import type { AuditEntityType, AuditLog } from "@/types/database.types";

const ENTITY_TYPE_LABELS: Record<AuditEntityType, string> = {
  product: "Produit",
  category: "Catégorie",
  coupon: "Coupon",
  reduction: "Réduction",
  order: "Commande",
  store_settings: "Paramètres",
  pickup_opening_hours: "Horaires de retrait",
  pickup_closure: "Fermeture",
  loyalty_reward: "Récompense fidélité",
  user: "Utilisateur",
  auth: "Authentification",
};

const ENTITY_TYPE_OPTIONS = Object.keys(ENTITY_TYPE_LABELS) as AuditEntityType[];

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Martinique",
  }).format(new Date(dateString));
}

function formatFieldName(field: string): string {
  const label = field.replace(/_/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function actionLabel(action: string): string {
  return AUDIT_ACTIONS[action as keyof typeof AUDIT_ACTIONS] ?? action;
}

type ActorOption = { id: string; label: string };

interface AuditLogExplorerProps {
  initialLogs: AuditLog[];
  initialTotal: number;
  pageSize: number;
  actorOptions: ActorOption[];
}

export function AuditLogExplorer({ initialLogs, initialTotal, pageSize, actorOptions }: AuditLogExplorerProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ actorId: "", entityType: "", from: "", to: "" });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchLogs = useCallback(async (nextPage: number, nextFilters: typeof filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize) });
      if (nextFilters.actorId) params.set("actorId", nextFilters.actorId);
      if (nextFilters.entityType) params.set("entityType", nextFilters.entityType);
      if (nextFilters.from) params.set("from", nextFilters.from);
      if (nextFilters.to) params.set("to", nextFilters.to);

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setLogs(data.logs ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const goToPage = (nextPage: number) => {
    const clamped = Math.min(totalPages, Math.max(1, nextPage));
    setPage(clamped);
    void fetchLogs(clamped, filters);
  };

  const applyFilters = (nextFilters: Partial<typeof filters>) => {
    const merged = { ...filters, ...nextFilters };
    setFilters(merged);
    setPage(1);
    void fetchLogs(1, merged);
  };

  const resetFilters = () => {
    const empty = { actorId: "", entityType: "", from: "", to: "" };
    setFilters(empty);
    setPage(1);
    void fetchLogs(1, empty);
  };

  const hasActiveFilters = Boolean(filters.actorId || filters.entityType || filters.from || filters.to);

  return (
    <div className="space-y-4">
      <Card padding="md">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <label className="text-sm text-gray-700">
            Acteur
            <select
              value={filters.actorId}
              onChange={(event) => applyFilters({ actorId: event.target.value })}
              className="mt-1 w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            >
              <option value="">Tous</option>
              {actorOptions.map((actor) => (
                <option key={actor.id} value={actor.id}>{actor.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-gray-700">
            Type
            <select
              value={filters.entityType}
              onChange={(event) => applyFilters({ entityType: event.target.value })}
              className="mt-1 w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            >
              <option value="">Tous</option>
              {ENTITY_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>{ENTITY_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-gray-700">
            Du
            <input
              type="date"
              value={filters.from}
              onChange={(event) => applyFilters({ from: event.target.value })}
              className="mt-1 w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </label>

          <label className="text-sm text-gray-700">
            Au
            <input
              type="date"
              value={filters.to}
              onChange={(event) => applyFilters({ to: event.target.value })}
              className="mt-1 w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </label>

          <Button type="button" variant="secondary" onClick={resetFilters} disabled={!hasActiveFilters}>
            Réinitialiser
          </Button>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Acteur</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucune activité trouvée</td></tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const hasDetails = (log.changes?.length ?? 0) > 0 || (log.metadata && Object.keys(log.metadata).length > 0);
                  return (
                    <Fragment key={log.id}>
                      <tr
                        className={hasDetails ? "cursor-pointer hover:bg-gray-50" : ""}
                        onClick={() => hasDetails && setExpandedId(isExpanded ? null : log.id)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(log.created_at)}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{log.actor_name || log.actor_email || "Utilisateur supprimé"}</span>
                          <span className="ml-2 text-xs text-gray-400">{log.actor_role === "admin" ? "Admin" : "Employé"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" size="sm">{ENTITY_TYPE_LABELS[log.entity_type]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <p className="font-medium">{actionLabel(log.action)}</p>
                          <p className="text-gray-500">{log.summary}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {hasDetails && (
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasDetails && (
                        <tr key={`${log.id}-details`}>
                          <td colSpan={5} className="bg-gray-50 px-4 py-4">
                            {log.changes && log.changes.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase text-gray-500">Champs modifiés</p>
                                <ul className="space-y-1">
                                  {log.changes.map((change) => (
                                    <li key={change.field} className="text-gray-700">
                                      <span className="font-medium">{formatFieldName(change.field)}</span> :{" "}
                                      <span className="text-gray-500 line-through">{formatValue(change.old)}</span>
                                      {" → "}
                                      <span className="text-gray-900">{formatValue(change.new)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div className="mt-3 space-y-1">
                                <p className="text-xs font-semibold uppercase text-gray-500">Détails</p>
                                <ul className="space-y-1">
                                  {Object.entries(log.metadata).map(([key, value]) => (
                                    <li key={key} className="text-gray-700">
                                      <span className="font-medium">{formatFieldName(key)}</span> : {formatValue(value)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {(log.ip_address || log.user_agent) && (
                              <p className="mt-3 text-xs text-gray-400">
                                {log.ip_address ? `IP : ${log.ip_address}` : ""}
                                {log.ip_address && log.user_agent ? " · " : ""}
                                {log.user_agent ?? ""}
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <Card padding="md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              Page {page} sur {totalPages} ({total} entrées)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1 || loading}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages || loading}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
