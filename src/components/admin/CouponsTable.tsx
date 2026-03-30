"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Search,
  Clock,
  Ticket
} from "lucide-react";

import { formatPrice } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  starts_at: string | null;
  expires_at: string | null;
  used_count: number;
  usage_limit: number | null;
  is_active: boolean;
  is_first_order_only: boolean;
}

interface CouponsTableProps {
  coupons: Coupon[];
  onDelete: (id: string) => void;
}

export function CouponsTable({ coupons, onDelete }: CouponsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getStatus = (coupon: Coupon) => {
    if (!coupon.is_active) return { label: "Inactif", color: "text-gray-500 bg-gray-100" };

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { label: "Expiré", color: "text-red-700 bg-red-100" };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { label: "Épuisé", color: "text-orange-700 bg-orange-100" };
    }

    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      return { label: "Planifié", color: "text-blue-700 bg-blue-100" };
    }

    return { label: "Actif", color: "text-green-700 bg-green-100" };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par code..."
          className="flex-1 outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Réduction</th>
                <th className="px-6 py-4 font-semibold">Utilisation</th>
                <th className="px-6 py-4 font-semibold">Validité</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun coupon trouvé.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const status = getStatus(coupon);
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block font-mono">
                              {coupon.code}
                            </span>
                            {coupon.description && (
                              <span className="text-xs text-gray-500">
                                {coupon.description}
                              </span>
                            )}
                            {coupon.is_first_order_only && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                1ère commande
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {coupon.discount_type === "percentage"
                            ? `-${coupon.discount_value}%`
                            : `-${formatPrice(coupon.discount_value)}`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {coupon.used_count} / {coupon.usage_limit || "∞"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3 h-3" />
                          {formatDate(coupon.starts_at)} → {formatDate(coupon.expires_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/coupons/${coupon.id}`}>
                            <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => onDelete(coupon.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
