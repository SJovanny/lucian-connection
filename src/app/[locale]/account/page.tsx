"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Order, OrderItem, Profile } from "@/types/database.types";

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursement",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-green-200 text-green-900",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Martinique",
  }).format(date);
}

function formatPickupDate(dateString: string | null) {
  if (!dateString) return "Non planifié";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Martinique",
  }).format(new Date(dateString));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function AccountPage() {
  const locale = useLocale();
  const router = useRouter();
  const supabase = useMemo(() => (getSupabaseConfig() ? createClient() : null), []);
  const pageSize = 5;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    email: "",
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItemsByOrderId, setOrderItemsByOrderId] = useState<Record<string, OrderItem[]>>({});
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      if (!supabase) {
        setError("Le service de compte est temporairement indisponible");
        setIsLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login`);
        return;
      }

      setProfile((prev) => ({
        ...prev,
        email: user.email || "",
      }));

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError("Impossible de charger votre profil");
      }
      const typedProfile = profileData as Pick<Profile, "full_name" | "phone"> | null;

      if (typedProfile) {
        setProfile({
          full_name: typedProfile.full_name || "",
          phone: typedProfile.phone || "",
          email: user.email || "",
        });
      }

      const { data: ordersData, count } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const safeOrders = (ordersData || []) as Order[];
      setOrders(safeOrders);
      setTotalOrders(count || 0);
      setExpandedOrders({});

      if (safeOrders.length > 0) {
        const orderIds = safeOrders.map((order) => order.id);
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

        const typedOrderItems = (orderItems || []) as OrderItem[];

        const grouped = typedOrderItems.reduce<Record<string, OrderItem[]>>(
          (acc, item) => {
            const orderId = item.order_id;
            acc[orderId] = acc[orderId] || [];
            acc[orderId].push(item as OrderItem);
            return acc;
          },
          {}
        );

        setOrderItemsByOrderId(grouped);
      } else {
        setOrderItemsByOrderId({});
      }
      setIsLoading(false);
    };

    load();
  }, [page, router, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError("Le service de compte est temporairement indisponible");
      setIsSaving(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login`);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Impossible de mettre à jour le profil");
    } else {
      setSuccess("Profil mis à jour");
    }

    setIsSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              {locale === "fr" ? "Mon compte" : "My account"}
            </h1>
            <p className="text-gray-500 mt-1">
              {locale === "fr"
                ? "Gérez vos informations et suivez vos commandes"
                : "Manage your profile and track your orders"}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Profil</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-gray-500">Chargement...</p>
                ) : (
                  <form className="space-y-4" onSubmit={handleSave}>
                    <Input
                      label="Nom complet"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Votre nom"
                    />
                    <Input
                      label="Email"
                      value={profile.email}
                      disabled
                      placeholder="Email"
                    />
                    <Input
                      label="Téléphone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+1 758 555 1234"
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}

                    <Button type="submit" variant="primary" isLoading={isSaving}>
                      Enregistrer
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Commandes récentes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-gray-500">Chargement...</p>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500">Aucune commande pour le moment</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col gap-3 p-3 border border-gray-100 rounded-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="text-sm text-gray-500">#{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                            <p className="text-sm font-medium text-primary-700">
                              Retrait : {formatPickupDate(order.pickup_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(order.total_amount)}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                statusColors[order.status]
                              }`}
                            >
                              {statusLabels[order.status]}
                            </span>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                setExpandedOrders((prev) => ({
                                  ...prev,
                                  [order.id]: !prev[order.id],
                                }))
                              }
                              aria-expanded={!!expandedOrders[order.id]}
                            >
                              {expandedOrders[order.id] ? "Masquer" : "Voir"}
                            </Button>
                          </div>
                        </div>
                        {expandedOrders[order.id] && (
                          <div className="border-t border-dashed pt-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Articles
                            </p>
                            {orderItemsByOrderId[order.id]?.length ? (
                              <ul className="mt-2 space-y-2">
                                {orderItemsByOrderId[order.id].map((item) => (
                                  <li key={item.id} className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.product_name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {item.quantity} × {formatCurrency(item.unit_price)}
                                      </p>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(item.total_price)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2 text-sm text-gray-500">Aucun article disponible.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {Math.ceil(totalOrders / pageSize) > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-gray-500">
                          Page {page} sur {Math.ceil(totalOrders / pageSize)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page === 1}
                          >
                            Précédent
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              setPage((prev) =>
                                Math.min(Math.ceil(totalOrders / pageSize), prev + 1)
                              )
                            }
                            disabled={page >= Math.ceil(totalOrders / pageSize)}
                          >
                            Suivant
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
