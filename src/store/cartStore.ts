import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  unit: string;
  is_alcoholic: boolean;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

const MAX_QUANTITY = 100;

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string"
    && typeof item.name === "string"
    && typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0
    && typeof item.quantity === "number" && Number.isSafeInteger(item.quantity)
    && item.quantity > 0 && item.quantity <= MAX_QUANTITY
    && (item.image_url === null || typeof item.image_url === "string")
    && typeof item.unit === "string"
    && typeof item.is_alcoholic === "boolean";
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        if (!isCartItem({ ...item, quantity: 1 })) return;
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) } : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (!Number.isSafeInteger(quantity)) return;
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "lucian-cart",
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const items = persistedState && typeof persistedState === "object" && "items" in persistedState
          ? persistedState.items
          : undefined;
        return {
          ...currentState,
          items: Array.isArray(items) ? items.filter(isCartItem) : [],
        };
      },
    }
  )
);
