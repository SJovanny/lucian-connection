"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Edit, Trash2, Tag, FolderTree, Package } from "lucide-react";

interface Reduction {
  id: string;
  name: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  applies_to: "all" | "categories" | "products";
  category_ids: string[];
  product_ids: string[];
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  priority: number;
}

interface ReductionsTableProps {
  reductions: Reduction[];
  onDelete: (id: string) => void;
}

export function ReductionsTable({ reductions, onDelete }: ReductionsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDiscount = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return `${value}€`;
  };

  const getAppliesIcon = (appliesTo: string) => {
    switch (appliesTo) {
      case "all":
        return <Tag className="w-4 h-4" />;
      case "categories":
        return <FolderTree className="w-4 h-4" />;
      case "products":
        return <Package className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getAppliesLabel = (reduction: Reduction) => {
    switch (reduction.applies_to) {
      case "all":
        return "Tous les produits";
      case "categories":
        return `${reduction.category_ids.length} catégorie(s)`;
      case "products":
        return `${reduction.product_ids.length} produit(s)`;
      default:
        return "—";
    }
  };

  const isActive = (reduction: Reduction) => {
    if (!reduction.is_active) return false;
    
    const now = new Date();
    if (reduction.starts_at && new Date(reduction.starts_at) > now) return false;
    if (reduction.expires_at && new Date(reduction.expires_at) < now) return false;
    
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Réduction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Portée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priorité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reductions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Aucune réduction trouvée
                </td>
              </tr>
            ) : (
              reductions.map((reduction) => (
                <tr key={reduction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{reduction.name}</div>
                      {reduction.description && (
                        <div className="text-sm text-gray-500 mt-1">{reduction.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-primary-600">
                      {formatDiscount(reduction.discount_type, reduction.discount_value)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      {getAppliesIcon(reduction.applies_to)}
                      <span>{getAppliesLabel(reduction)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{formatDate(reduction.starts_at)}</div>
                    <div className="text-gray-400">→ {formatDate(reduction.expires_at)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={reduction.priority > 0 ? "primary" : "default"}>
                      {reduction.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={isActive(reduction) ? "success" : "default"}>
                      {isActive(reduction) ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/reductions/${reduction.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(reduction.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
