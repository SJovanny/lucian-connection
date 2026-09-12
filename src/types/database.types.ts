// Database types for Lucian Connection

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
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
  is_alcoholic: boolean;
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
  role: "customer" | "admin" | "employee";
  loyalty_points_balance: number;
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
  payment_session_id: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  fulfillment_status_before_refund: OrderStatus | null;
  refund_points_adjusted: number;
  terms_version: string | null;
  contains_alcohol: boolean;
  age_confirmed_at: string | null;
  pickup_age_verified_at: string | null;
  pickup_age_verified_by: string | null;
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
  user_id: string | null;
};

export type CouponUsage = {
  id: string;
  coupon_id: string;
  order_id: string;
  user_id: string | null;
  created_at: string;
};

export type CouponReservation = {
  id: string;
  coupon_id: string;
  order_id: string;
  user_id: string | null;
  status: "reserved" | "consumed" | "released";
  expires_at: string;
  created_at: string;
  updated_at: string;
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
  loyalty_points_per_euro: number;
};

export type LoyaltyReward = {
  id: string;
  name: string;
  points_cost: number;
  discount_type: DiscountType;
  discount_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LoyaltyLedgerEntry = {
  id: string;
  user_id: string;
  order_id: string | null;
  order_refund_id: string | null;
  type: "earn" | "redeem" | "adjustment";
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
};

export type LoyaltyRedemption = {
  id: string;
  user_id: string;
  reward_id: string;
  coupon_id: string;
  points_spent: number;
  created_at: string;
  loyalty_rewards?: LoyaltyReward;
  coupons?: Coupon;
};

export type OrderRefundItem = {
  order_item_id?: string;
  product_id?: string | null;
  quantity: number;
  amount: number;
};

export type OrderRefund = {
  id: string;
  order_id: string;
  user_id: string;
  request_key: string | null;
  stripe_refund_id: string | null;
  stripe_status: string | null;
  failure_reason: string | null;
  pending_reason: string | null;
  last_stripe_sync_at: string | null;
  stripe_reference: string | null;
  stripe_reference_status: string | null;
  stripe_reference_type: string | null;
  amount: number;
  product_amount: number;
  items: OrderRefundItem[];
  status: "pending" | "succeeded" | "failed" | "canceled";
  points_reversed: number;
  points_restored: number;
  reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StockReservation = {
  id: string;
  order_id: string;
  order_item_id: string;
  product_id: string;
  quantity: number;
  stock_tracked: boolean;
  status: "reserved" | "consumed" | "released";
  expires_at: string;
  released_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StockMovement = {
  id: string;
  product_id: string;
  order_id: string | null;
  order_item_id: string | null;
  reservation_id: string | null;
  refund_id: string | null;
  quantity_delta: number;
  movement_type: "reserve" | "release" | "refund" | "adjustment";
  reason: string | null;
  created_at: string;
};

export type CheckoutAttempt = {
  id: string;
  user_id: string;
  request_key: string;
  request_fingerprint: string;
  order_id: string | null;
  stripe_session_id: string | null;
  stripe_session_url: string | null;
  status: "prepared" | "session_created";
  created_at: string;
  updated_at: string;
};

export type StripeWebhookEvent = {
  id: string;
  stripe_event_id: string;
  event_type: string;
  status: "processing" | "processed" | "failed";
  attempts: number;
  last_error_code: string | null;
  locked_until: string | null;
  received_at: string;
  processed_at: string | null;
  updated_at: string;
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

export type AuditEntityType =
  | "product"
  | "category"
  | "coupon"
  | "reduction"
  | "order"
  | "store_settings"
  | "pickup_opening_hours"
  | "pickup_closure"
  | "loyalty_reward"
  | "user"
  | "auth";

export type AuditChange = {
  field: string;
  old: unknown;
  new: unknown;
};

export type AuditLog = {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: "admin" | "employee" | "system";
  action: string;
  entity_type: AuditEntityType;
  entity_id: string | null;
  summary: string;
  changes: AuditChange[];
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
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
      loyalty_rewards: { Row: LoyaltyReward; Insert: Partial<LoyaltyReward> & { name: string; points_cost: number; discount_type: DiscountType; discount_value: number }; Update: Partial<LoyaltyReward>; Relationships: [] };
      loyalty_ledger: { Row: LoyaltyLedgerEntry; Insert: Partial<LoyaltyLedgerEntry> & { user_id: string; type: LoyaltyLedgerEntry["type"]; points: number; balance_after: number; description: string }; Update: Partial<LoyaltyLedgerEntry>; Relationships: [] };
      loyalty_redemptions: { Row: LoyaltyRedemption; Insert: Partial<LoyaltyRedemption> & { user_id: string; reward_id: string; coupon_id: string; points_spent: number }; Update: Partial<LoyaltyRedemption>; Relationships: [] };
      order_refunds: { Row: OrderRefund; Insert: Partial<OrderRefund> & { order_id: string; user_id: string; amount: number; product_amount: number }; Update: Partial<OrderRefund>; Relationships: [] };
      stock_reservations: { Row: StockReservation; Insert: Partial<StockReservation> & { order_id: string; order_item_id: string; product_id: string; quantity: number }; Update: Partial<StockReservation>; Relationships: [] };
      stock_movements: { Row: StockMovement; Insert: Partial<StockMovement> & { product_id: string; quantity_delta: number; movement_type: StockMovement["movement_type"] }; Update: Partial<StockMovement>; Relationships: [] };
      checkout_attempts: { Row: CheckoutAttempt; Insert: Partial<CheckoutAttempt> & { user_id: string; request_key: string; request_fingerprint: string }; Update: Partial<CheckoutAttempt>; Relationships: [] };
      stripe_webhook_events: { Row: StripeWebhookEvent; Insert: Partial<StripeWebhookEvent> & { stripe_event_id: string; event_type: string }; Update: Partial<StripeWebhookEvent>; Relationships: [] };
      coupon_usages: { Row: CouponUsage; Insert: Partial<CouponUsage> & { coupon_id: string; order_id: string }; Update: Partial<CouponUsage>; Relationships: [] };
      coupon_reservations: { Row: CouponReservation; Insert: Partial<CouponReservation> & { coupon_id: string; order_id: string }; Update: Partial<CouponReservation>; Relationships: [] };
      pickup_closures: { Row: PickupClosure; Insert: Partial<PickupClosure> & { closed_on: string }; Update: Partial<PickupClosure>; Relationships: [] };
      pickup_opening_hours: { Row: PickupOpeningHour; Insert: Partial<PickupOpeningHour> & { weekday: number }; Update: Partial<PickupOpeningHour>; Relationships: [] };
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog> & { actor_role: AuditLog["actor_role"]; action: string; entity_type: AuditEntityType; summary: string }; Update: Partial<AuditLog>; Relationships: [] };
    };
    Views: {
      products_with_discount: { Row: Product & { discounted_price: number | null }; Relationships: [{ foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }] };
      coupons_active: { Row: Coupon; Relationships: [] };
    };
    Functions: {
      get_pickup_closed_dates: { Args: Record<string, never>; Returns: { closed_on: string }[] };
      loyalty_earn_points: { Args: { p_user_id: string; p_order_id: string; p_points: number; p_description: string }; Returns: { new_balance: number; applied: boolean }[] };
      loyalty_redeem_points: { Args: { p_user_id: string; p_reward_id: string; p_description: string }; Returns: { new_balance: number; points_spent: number }[] };
      loyalty_apply_refund: { Args: { p_refund_id: string }; Returns: { points_reversed: number; new_balance: number }[] };
      reconcile_order_refund_loyalty: { Args: { p_order_id: string; p_refund_id?: string | null }; Returns: { points_adjustment: number; new_balance: number }[] };
      recompute_order_refund_state: { Args: { p_order_id: string }; Returns: { payment_status: string; order_status: string; refunded_at: string | null }[] };
      loyalty_redeem_reward: { Args: { p_user_id: string; p_reward_id: string }; Returns: { coupon_id: string; coupon_code: string; new_balance: number; points_spent: number }[] };
      use_coupon: { Args: { p_coupon_id: string; p_order_id: string; p_user_id: string | null }; Returns: boolean };
      reserve_coupon: { Args: { p_coupon_id: string; p_order_id: string; p_user_id: string }; Returns: boolean };
      release_coupon_reservation: { Args: { p_order_id: string; p_user_id: string | null }; Returns: boolean };
      record_audit_event: { Args: { p_action: string; p_entity_type: AuditEntityType; p_entity_id?: string | null; p_summary?: string | null; p_changes?: AuditChange[]; p_metadata?: Record<string, unknown>; p_ip_address?: string | null; p_user_agent?: string | null }; Returns: string };
      record_system_audit_event: { Args: { p_action: string; p_entity_type: AuditEntityType; p_entity_id?: string | null; p_summary?: string | null; p_metadata?: Record<string, unknown> }; Returns: string };
      purge_audit_logs: { Args: { p_retention_days?: number }; Returns: number };
      prepare_checkout_order: { Args: {
        p_user_id: string; p_request_key: string; p_request_fingerprint: string;
        p_phone: string; p_full_name: string; p_email: string; p_notes: string | null;
        p_locale: string; p_pickup_at: string; p_coupon_id: string | null;
        p_subtotal_cents: number; p_preparation_fee_cents: number; p_discount_cents: number;
        p_total_cents: number; p_items: unknown[]; p_contains_alcohol: boolean;
        p_age_confirmed: boolean; p_terms_version: string; p_user_agent: string | null;
        p_ip_address?: string | null;
      }; Returns: { order_id: string; session_id: string | null; session_url: string | null; is_existing: boolean }[] };
      link_checkout_session: { Args: { p_user_id: string; p_request_key: string; p_order_id: string; p_session_id: string; p_session_url: string }; Returns: boolean };
      claim_stripe_webhook_event: { Args: { p_event_id: string; p_event_type: string }; Returns: boolean };
      complete_stripe_webhook_event: { Args: { p_event_id: string }; Returns: boolean };
      fail_stripe_webhook_event: { Args: { p_event_id: string; p_error_code: string | null }; Returns: boolean };
      finalize_paid_order: { Args: { p_order_id: string; p_session_id: string; p_payment_intent: string; p_event_id?: string | null }; Returns: { payment_status: string; processed: boolean }[] };
      cancel_pending_order: { Args: { p_order_id: string }; Returns: boolean };
      cancel_abandoned_orders: { Args: { p_max_age?: string }; Returns: number };
      reserve_order_stock: { Args: { p_order_id: string }; Returns: number };
      consume_order_stock: { Args: { p_order_id: string }; Returns: number };
      release_order_stock: { Args: { p_order_id: string }; Returns: number };
      restock_stock_for_refund: { Args: { p_refund_id: string }; Returns: number };
      create_refund_reservation: { Args: { p_order_id: string; p_user_id: string; p_request_key: string; p_full_order: boolean; p_item_ids: string[]; p_created_by?: string | null }; Returns: { id: string; request_key: string; stripe_refund_id: string | null; amount: number; product_amount: number; status: string; items: OrderRefundItem[] }[] };
      mark_refund_failed: { Args: { p_refund_id: string; p_reason?: string | null }; Returns: boolean };
      sync_stripe_refund: { Args: {
        p_local_refund_id: string | null; p_order_id: string; p_user_id: string;
        p_stripe_refund_id: string; p_payment_intent: string; p_stripe_status: string | null;
        p_failure_reason: string | null; p_pending_reason: string | null;
        p_stripe_reference: string | null; p_stripe_reference_status: string | null;
        p_stripe_reference_type: string | null; p_amount: number; p_product_amount: number;
        p_items: OrderRefundItem[]; p_status: string;
      }; Returns: {
        refund_id: string; refund_order_id: string; refund_status: string; stripe_status: string | null;
        refund_amount: number; refund_product_amount: number; refund_items: OrderRefundItem[];
        payment_status: string; order_status: string; refunded_at: string | null; points_adjustment: number;
      }[] };
    };
    Enums: { role: "customer" | "admin" | "employee" };
    CompositeTypes: Record<string, never>;
  };
};
