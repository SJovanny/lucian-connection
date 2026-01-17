import { createAdminClient } from "./admin";
import type { Product, Category } from "@/types/database.types";

// Type pour les produits avec catégorie jointe
export type ProductWithCategory = Product & {
  categories: Category | null;
};

/**
 * Récupère tous les produits actifs avec leur catégorie
 * Utilise le client admin pour bypasser les RLS
 */
export async function getProducts(options?: {
  categorySlug?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
}): Promise<ProductWithCategory[]> {
  const supabase = createAdminClient();
  
  let query = supabase
    .from("products")
    .select(`
      *,
      categories (*)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Filtre par catégorie
  if (options?.categorySlug && options.categorySlug !== "all") {
    // Récupérer l'ID de la catégorie d'abord
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
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
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
  const supabase = createAdminClient();
  
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
