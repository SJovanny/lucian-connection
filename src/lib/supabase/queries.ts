import { createClient } from "./server";
import { getSupabaseConfig } from "./config";
import type { Category, Order, OrderItem, Product, Profile, OrderStatus } from "@/types/database.types";

// Type pour les produits avec catégorie jointe
export type ProductWithCategory = Product & {
  categories: Category | null;
  discounted_price?: number | null;
};

/**
 * Récupère tous les produits actifs avec leur catégorie
 * Utilise le client admin pour bypasser les RLS
 */
export async function getProducts(options?: {
  categorySlug?: string;
  categorySlugs?: string[];
  search?: string;
  featured?: boolean;
  limit?: number;
}): Promise<ProductWithCategory[]> {
  if (!getSupabaseConfig()) return [];

  const supabase = await createClient();
  
  let query = supabase
    .from("products_with_discount")
    .select(`
      *,
      discounted_price,
      categories (*)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Filtre par catégorie unique
  if (options?.categorySlug && options.categorySlug !== "all") {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();
    
    if (categoryData) {
      const categoryId = (categoryData as { id: string }).id;
      query = query.eq("category_id", categoryId);
    }
  }
  // Filtre par plusieurs catégories (groupe)
  else if (options?.categorySlugs && options.categorySlugs.length > 0) {
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id")
      .in("slug", options.categorySlugs);
      
    const typedCategories = (categoriesData || []) as Array<{ id: string }>;
    if (typedCategories.length > 0) {
      const categoryIds = typedCategories.map((c) => c.id);
      query = query.in("category_id", categoryIds);
    }
  }

  // Filtre par recherche (nom en français ou anglais)
  if (options?.search) {
    const searchTerm = `%${options.search}%`;
    query = query.or(`translations->fr->>name.ilike.${searchTerm},translations->en->>name.ilike.${searchTerm}`);
  }

  // Filtre pour les produits vedettes
  if (options?.featured) {
    query = query.eq("is_featured", true);
  }

  // Limite le nombre de résultats
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data || []) as ProductWithCategory[];
}

/**
 * Récupère un produit par son slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("products_with_discount")
    .select(`
      *,
      discounted_price,
      categories (*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as ProductWithCategory;
}

/**
 * Récupère toutes les catégories
 */
export async function getCategories(): Promise<Category[]> {
  if (!getSupabaseConfig()) return [];

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return (data || []) as Category[];
}

/**
 * Récupère une catégorie par son ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }

  return data as Category;
}

/**
 * Récupère tous les produits pour la gestion d'inventaire
 */
export async function getAllProductsForInventory(): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products for inventory:", error);
    return [];
  }

  return (data || []) as ProductWithCategory[];
}

/**
 * Met à jour le stock d'un produit
 */
export async function updateProductStock(productId: string, newStock: number) {
  const supabase = await createClient();
  const updateData: Partial<Product> = { stock: newStock };
  
  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    console.error("Error updating product stock:", error);
    return null;
  }

  return data;
}

/**
 * Récupère les produits vedettes pour la page d'accueil
 */
export async function getFeaturedProducts(limit: number = 10): Promise<ProductWithCategory[]> {
  return getProducts({ featured: true, limit });
}

/**
 * Recherche de produits avec texte
 */
export async function searchProducts(searchTerm: string): Promise<ProductWithCategory[]> {
  return getProducts({ search: searchTerm });
}

/**
 * Récupère toutes les commandes avec leurs détails
 */
export async function getAllOrders(options?: {
  status?: string;
  search?: string;
  date?: string;
}) {
  const supabase = await createClient();
  type OrderWithDetails = Order & {
    order_items: OrderItem[];
    profiles: Pick<Profile, "full_name" | "phone"> | null;
  };
  
  let query = supabase
    .from("orders")
    .select(`
      *,
      order_items (*),
      profiles (full_name, phone)
    `)
    .order("created_at", { ascending: false });

  // Filter by status
  if (options?.status && options.status !== "") {
    query = query.eq("status", options.status as OrderStatus);
  }

  // Filter by date
  if (options?.date) {
    const startDate = new Date(options.date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(options.date);
    endDate.setHours(23, 59, 59, 999);
    
    query = query.gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  // Filter by search term (order ID or customer name)
  let results = (data || []) as unknown as OrderWithDetails[];
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    results = results.filter((order) => {
      const customerName = order.profiles?.full_name?.toLowerCase() || "";
      const orderId = order.id.toLowerCase();
      return orderId.includes(searchLower) || customerName.includes(searchLower);
    });
  }

  return results;
}

/**
 * Récupère les commandes récentes
 */
export async function getRecentOrders(limit: number = 10) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data || [];
}

/**
 * Récupère les statistiques des commandes par statut
 */
export async function getOrderStatusCounts() {
  const supabase = await createClient();
  
  const statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled', 'refunded'];
  const counts: Record<string, number> = {};

  for (const status of statuses) {
    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", status as OrderStatus);

    if (!error) {
      counts[status] = count || 0;
    }
  }

  return counts;
}

/**
 * Récupère les statistiques des commandes
 */
export async function getOrderStats() {
  const supabase = await createClient();
  
  // Commandes du jour
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: todayOrders, error: todayError } = await supabase
    .from("orders")
    .select("id, total_amount, status")
    .gte("created_at", today.toISOString());

  if (todayError) {
    console.error("Error fetching today orders:", todayError);
  }

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "preparing"]);

  const { count: cancelledOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "cancelled");

  const { count: refundedOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "refunded");

  const typedTodayOrders = (todayOrders || []) as Array<Pick<Order, "status" | "total_amount">>;
  const todayRevenue = typedTodayOrders
    .filter((order) => order.status !== "cancelled" && order.status !== "refunded")
    .reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const todayCount = todayOrders?.length || 0;

  return {
    todayOrders: todayCount,
    todayRevenue,
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    cancelledOrders: cancelledOrders || 0,
    refundedOrders: refundedOrders || 0,
  };
}
