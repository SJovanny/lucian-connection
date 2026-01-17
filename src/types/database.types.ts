export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Type for simple translated field (key: string)
export type TranslatedField = {
  fr: string;
  en: string;
};

// Type for category translations
export type CategoryTranslations = {
  fr: { name: string };
  en: { name: string };
};

// Type for product translations
export type ProductTranslations = {
  fr: { name: string; description: string };
  en: { name: string; description: string };
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          image_url: string | null;
          display_order: number;
          translations: CategoryTranslations;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          image_url?: string | null;
          display_order?: number;
          translations: CategoryTranslations;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          image_url?: string | null;
          display_order?: number;
          translations?: CategoryTranslations;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          slug: string;
          price: number;
          compare_at_price: number | null;
          category_id: string | null;
          image_url: string | null;
          translations: ProductTranslations;
          stock: number;
          low_stock_threshold: number;
          track_stock: boolean;
          unit: string;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          price: number;
          compare_at_price?: number | null;
          category_id?: string | null;
          image_url?: string | null;
          translations: ProductTranslations;
          stock?: number;
          low_stock_threshold?: number;
          track_stock?: boolean;
          unit?: string;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          price?: number;
          compare_at_price?: number | null;
          category_id?: string | null;
          image_url?: string | null;
          translations?: ProductTranslations;
          stock?: number;
          low_stock_threshold?: number;
          track_stock?: boolean;
          unit?: string;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          address: string | null;
          role: "customer" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          address?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          address?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
          subtotal: number;
          delivery_fee: number;
          total_amount: number;
          delivery_address: string | null;
          phone: string | null;
          notes: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
          subtotal: number;
          delivery_fee?: number;
          total_amount: number;
          delivery_address?: string | null;
          phone?: string | null;
          notes?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          status?: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
          subtotal?: number;
          delivery_fee?: number;
          total_amount?: number;
          delivery_address?: string | null;
          phone?: string | null;
          notes?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

// Helper types
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export type OrderStatus = Order["status"];
export type UserRole = Profile["role"];
