// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { createJSONStorage } from "zustand/middleware";
import { useCartStore, type CartItem } from "@/store/cartStore";

const item: CartItem = {
  id: "juice", name: "Juice", price: 2.5, quantity: 2,
  image_url: null, unit: "bottle", is_alcoholic: false,
};

const stored = new Map<string, string>();
const localStorage = {
  getItem: (key: string) => stored.get(key) ?? null,
  setItem: (key: string, value: string) => { stored.set(key, value); },
  removeItem: (key: string) => { stored.delete(key); },
  clear: () => stored.clear(),
};

beforeEach(() => {
  useCartStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) });
  localStorage.clear();
  useCartStore.setState({ items: [], isOpen: false });
});

async function hydrate(state: unknown) {
  localStorage.setItem("lucian-cart", JSON.stringify({ state, version: 0 }));
  await useCartStore.persist.rehydrate();
}

describe("cart hydration", () => {
  it("preserves valid items and exposes correct totals without restoring transient state or actions", async () => {
    const free = { ...item, id: "free", price: 0, quantity: 100, image_url: "/free.png" };
    await hydrate({ items: [item, free], isOpen: true, getSubtotal: "broken" });
    expect(useCartStore.getState().items).toEqual([item, free]);
    expect(useCartStore.getState().getSubtotal()).toBe(5);
    expect(useCartStore.getState().getItemCount()).toBe(102);
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it("drops malformed entries while retaining valid neighbors", async () => {
    const invalid = [null, "item", {},
      ...["2", 0, -1, 1.5, 101, Number.MAX_SAFE_INTEGER + 1].map(quantity => ({ ...item, quantity })),
      ...["2.5", -1, null].map(price => ({ ...item, price })),
      ...[{ id: 1 }, { name: null }, { unit: null }, { image_url: 1 }, { is_alcoholic: "false" }].map(fields => ({ ...item, ...fields })),
    ];
    await hydrate({ items: [...invalid, item] });
    expect(useCartStore.getState().items).toEqual([item]);
    expect(useCartStore.getState().getItemCount()).toBe(2);
    expect(useCartStore.getState().getSubtotal()).toBe(5);
  });

  it("rejects non-finite JSON numbers", async () => {
    localStorage.setItem("lucian-cart", `{"state":{"items":[${JSON.stringify(item).replace('"price":2.5', '"price":1e400')}]},"version":0}`);
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().getSubtotal()).toBe(0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it.each([null, [], {}, { items: null }, { items: {} }, { items: "bad" }].map(state => ({ state })))("handles malformed persisted state $state", async ({ state }) => {
    await hydrate(state);
    expect(useCartStore.getState().items).toEqual([]);
    useCartStore.getState().addItem(item);
    expect(useCartStore.getState().getItemCount()).toBe(1);
  });
});

describe("cart quantity mutations", () => {
  it("caps updates and repeated additions at 100", () => {
    useCartStore.getState().addItem(item);
    useCartStore.getState().updateQuantity(item.id, 99);
    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem(item);
    expect(useCartStore.getState().getItemCount()).toBe(100);
    useCartStore.getState().updateQuantity(item.id, 101);
    expect(useCartStore.getState().getItemCount()).toBe(100);
    expect(useCartStore.getState().getSubtotal()).toBe(250);
  });

  it.each([NaN, Infinity, -Infinity, 1.5, -0.5, Number.MAX_SAFE_INTEGER + 1, "3"])("ignores invalid quantity %s", quantity => {
    useCartStore.getState().addItem(item);
    useCartStore.getState().updateQuantity(item.id, quantity as number);
    expect(useCartStore.getState().getItemCount()).toBe(1);
  });

  it.each([0, -1])("preserves removal for quantity %s", quantity => {
    useCartStore.getState().addItem(item);
    useCartStore.getState().updateQuantity(item.id, quantity);
    expect(useCartStore.getState().items).toEqual([]);
  });
});
