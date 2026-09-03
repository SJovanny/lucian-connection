// Database types for Lucian Connection

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "cancelled"
  | "refunded";

export type DiscountType = "percentage" | "fixed";
export type AppliesTo = "all" | "categories" | "products";

export type CategoryTranslations = {
  fr: { name: string };
  en: { name: string };
};

export type Category = {
  id: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  translations: CategoryTranslations;
  created_at: string;
};

export type Product = {
  id: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  image_url: string | null;
  translations: {
    fr: { name: string; description: string };
    en: { name: string; description: string };
  };
  allergens: { fr: string[]; en: string[] };
  stock: number;
  low_stock_threshold: number;
  track_stock: boolean;
  unit: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  dashboard_locale: string;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address: string | null;
  phone: string | null;
  notes: string | null;
  locale: string;
  coupon_id: string | null;
  discount_amount: number;
  pickup_at: string | null;
  created_at: string;
  updated_at: string;
  payment_status: "pending_payment" | "paid" | "payment_failed" | "cancelled" | "refunded" | "partially_refunded";
  payment_provider: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  terms_version: string | null;
};

export type LegalAcceptance = {
  id: string;
  user_id: string;
  document_type: string;
  document_version: string;
  order_id: string | null;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  starts_at: string;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_first_order_only: boolean;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
};

export type Reduction = {
  id: string;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  applies_to: AppliesTo;
  category_ids: string[];
  product_ids: string[];
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  created_by: string | null;
  updated_at: string;
};

export type StoreSettings = {
  id: string;
  preparation_fee: number;
  min_order_amount: number;
  updated_at: string;
  updated_by: string | null;
};

export type PickupClosure = {
  id: string;
  closed_on: string;
  reason: string | null;
  created_by: string | null;
  created_at: string;
};

export type PickupOpeningHour = {
  id: string;
  weekday: number;
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type Database = {
  public: {
    Tables: {
      categories: { Row: Category; Insert: Partial<Category> & { slug: string }; Update: Partial<Category>; Relationships: [{ foreignKeyName: "products_category_id_fkey"; columns: ["id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["category_id"] }] };
      products: { Row: Product; Insert: Partial<Product> & { slug: string; price: number }; Update: Partial<Product>; Relationships: [{ foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }] };
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile>; Relationships: [] };
      orders: { Row: Order; Insert: Partial<Order> & { subtotal: number; total_amount: number }; Update: Partial<Order>; Relationships: [{ foreignKeyName: "orders_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "order_items_order_id_fkey"; columns: ["id"]; isOneToOne: false; referencedRelation: "order_items"; referencedColumns: ["order_id"] }] };
      legal_acceptances: { Row: LegalAcceptance; Insert: Partial<LegalAcceptance> & { user_id: string; document_type: string; document_version: string }; Update: Partial<LegalAcceptance>; Relationships: [] };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem> & { order_id: string; product_name: string; quantity: number; unit_price: number; total_price: number }; Update: Partial<OrderItem>; Relationships: [{ foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }] };
      coupons: { Row: Coupon; Insert: Partial<Coupon> & { code: string; discount_type: DiscountType; discount_value: number }; Update: Partial<Coupon>; Relationships: [] };
      reductions: { Row: Reduction; Insert: Partial<Reduction> & { name: string; discount_type: DiscountType; discount_value: number; applies_to: AppliesTo }; Update: Partial<Reduction>; Relationships: [] };
      store_settings: { Row: StoreSettings; Insert: Partial<StoreSettings> & { preparation_fee: number; min_order_amount: number }; Update: Partial<StoreSettings>; Relationships: [] };
      pickup_closures: { Row: PickupClosure; Insert: Partial<PickupClosure> & { closed_on: string }; Update: Partial<PickupClosure>; Relationships: [] };
      pickup_opening_hours: { Row: PickupOpeningHour; Insert: Partial<PickupOpeningHour> & { weekday: number }; Update: Partial<PickupOpeningHour>; Relationships: [] };
    };
    Views: {
      products_with_discount: { Row: Product & { discounted_price: number | null }; Relationships: [{ foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }] };
      coupons_active: { Row: Coupon; Relationships: [] };
    };
    Functions: {
      get_pickup_closed_dates: { Args: Record<string, never>; Returns: { closed_on: string }[] };
    };
    Enums: { role: "customer" | "admin" };
    CompositeTypes: Record<string, never>;
  };
};
