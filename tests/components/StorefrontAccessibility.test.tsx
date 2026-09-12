// @vitest-environment jsdom

import React from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductCard } from "@/components/products/ProductCard";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/layout/Header";
import { SearchBar } from "@/components/layout/SearchBar";
import { ProductsContent } from "@/app/[locale]/products/ProductsContent";
import { useCartStore } from "@/store/cartStore";
import type { ProductWithCategory } from "@/lib/supabase/queries";

const mocks = vi.hoisted(() => ({ locale: "en", push: vi.fn() }));
vi.mock("next-intl", () => ({ useLocale: () => mocks.locale, useTranslations: () => (key: string) => key }));
vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({ push: mocks.push }), usePathname: () => "/products",
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("next/image", () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const imageProps = { ...props } as React.ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean };
  delete imageProps.unoptimized;
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...imageProps} alt={props.alt} />;
} }));
vi.mock("@/lib/supabase/config", () => ({ getSupabaseConfig: () => null }));
vi.mock("@/components/layout/LanguageSwitcher", () => ({ LanguageSwitcher: () => null }));
vi.mock("@/lib/client-pricing", () => ({
  fetchPricingQuote: async () => ({ items: [], subtotal_cents: 200, preparation_fee_cents: 0, total_cents: 200 }),
  getPricingErrorMessage: () => "Unavailable", PricingQuoteRequestError: class extends Error {},
}));

const product = {
  id: "juice", slug: "juice", price: 2, image_url: "/juice.png", unit: "1L", stock: 0,
  track_stock: false, is_alcoholic: false,
  translations: { en: { name: "Juice" }, fr: { name: "Jus" } }, categories: null,
} as ProductWithCategory;

let reduced: boolean;
let preference: EventTarget;
beforeEach(() => {
  mocks.locale = "en";
  mocks.push.mockClear();
  useCartStore.persist.setOptions({ storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } });
  useCartStore.setState({ items: [], isOpen: false });
  reduced = false;
  preference = new EventTarget();
  // Keep matches live across preference changes.
  Object.defineProperty(preference, "matches", { get: () => reduced, configurable: true });
  vi.stubGlobal("matchMedia", () => preference);
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe.each(["en", "fr"])("%s storefront accessible controls", (locale) => {
  it("names product controls and preserves add/increment/decrement behavior at zero stock", () => {
    mocks.locale = locale;
    render(<ProductCard product={product} />);
    fireEvent.click(screen.getByRole("button", { name: locale === "fr" ? "Ajouter Jus au panier" : "Add Juice to cart" }));
    fireEvent.click(screen.getByRole("button", { name: locale === "fr" ? "Augmenter la quantité de Jus" : "Increase quantity of Juice" }));
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    fireEvent.click(screen.getByRole("button", { name: locale === "fr" ? "Diminuer la quantité de Jus" : "Decrease quantity of Juice" }));
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it("associates the menu toggle with its visibility and names the cart", () => {
    mocks.locale = locale;
    render(<Header />);
    const toggle = screen.getByRole("button", { name: locale === "fr" ? "Menu de navigation" : "Navigation menu" });
    const panel = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toBeVisible();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel).toBeVisible();
    fireEvent.click(toggle);
    expect(panel).not.toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: locale === "fr" ? "Panier (0)" : "Cart (0)" }));
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it("provides cart actions and a checkout link without nested controls", async () => {
    mocks.locale = locale;
    useCartStore.setState({ isOpen: true, items: [{ id: "juice", name: "Juice", price: 2, quantity: 1, unit: "1L", image_url: null, is_alcoholic: false }] });
    render(<CartDrawer />);
    const link = await screen.findByRole("link", { name: "checkout" });
    expect(link).toHaveAttribute("href", "/checkout");
    expect(within(link).queryByRole("button")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: locale === "fr" ? "Augmenter la quantité de Juice" : "Increase quantity of Juice" }));
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    fireEvent.click(screen.getByRole("button", { name: locale === "fr" ? "Diminuer la quantité de Juice" : "Decrease quantity of Juice" }));
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: locale === "fr" ? "Retirer Juice du panier" : "Remove Juice from cart" }));
    expect(useCartStore.getState().items).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: locale === "fr" ? "Fermer le panier" : "Close cart" }));
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it("labels search and exposes keyboard-operable results as a named list", async () => {
    mocks.locale = locale;
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ products: [product] }) }));
    render(<SearchBar placeholder="Search..." />);
    const input = screen.getByRole("textbox", { name: locale === "fr" ? "Rechercher des produits" : "Search products" });
    fireEvent.change(input, { target: { value: "Ju" } });
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    const list = screen.getByRole("list", { name: locale === "fr" ? "Résultats de recherche" : "Search results" });
    expect(input).toHaveAttribute("aria-controls", list.id);
    expect(screen.queryByRole("combobox")).toBeNull();
    fireEvent.keyDown(within(list).getByRole("button"), { key: "Escape" });
    expect(screen.queryByRole("list")).toBeNull();
    expect(input).toHaveFocus();
    fireEvent.focus(input);
    fireEvent.click(within(screen.getByRole("list")).getByRole("button"));
    expect(mocks.push).toHaveBeenCalledWith(`/products?search=${locale === "fr" ? "Jus" : "Juice"}`);
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(screen.getByRole("button", { name: locale === "fr" ? "Effacer la recherche" : "Clear search" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: "juice" } });
    fireEvent.click(screen.getByRole("button", { name: locale === "fr" ? "Rechercher" : "Search" }));
    expect(mocks.push).toHaveBeenLastCalledWith("/products?search=juice");
  });
});

it("suppresses flying images for reduced motion and clears active images on preference change and unmount", () => {
  vi.useFakeTimers();
  const { unmount } = render(<><div id="cart-icon-container" /><ProductCard product={product} /></>);
  const add = () => fireEvent.click(screen.getByRole("button", { name: "Add Juice to cart" }));
  const clones = () => document.body.querySelectorAll('img[aria-hidden="true"]');
  reduced = true;
  add();
  expect(clones()).toHaveLength(0);
  expect(useCartStore.getState().items).toHaveLength(1);
  act(() => useCartStore.getState().clearCart());
  reduced = false;
  add();
  expect(clones()).toHaveLength(1);
  reduced = true;
  act(() => preference.dispatchEvent(new Event("change")));
  expect(clones()).toHaveLength(0);
  act(() => useCartStore.getState().clearCart());
  reduced = false;
  add();
  act(() => vi.advanceTimersByTime(1600));
  expect(clones()).toHaveLength(0);
  act(() => useCartStore.getState().clearCart());
  add();
  unmount();
  expect(clones()).toHaveLength(0);
  expect(vi.getTimerCount()).toBe(0);
});

it("removes the inert filter toggle while search and category clearing update results", () => {
  render(<ProductsContent initialProducts={[product]} categories={[]} initialCategory="missing" initialSearch="Juice" />);
  expect(screen.queryByRole("button", { name: "Filters" })).toBeNull();
  expect(screen.getByRole("status")).toHaveTextContent("0 products");
  fireEvent.click(screen.getByRole("button", { name: "Clear category filter" }));
  expect(screen.getByRole("status")).toHaveTextContent("1 products");
  const input = screen.getByRole("textbox", { name: "Search products" });
  fireEvent.change(input, { target: { value: "missing" } });
  expect(screen.getByRole("status")).toHaveTextContent("0 products");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(input).toHaveValue("");
  expect(screen.getByRole("status")).toHaveTextContent("1 products");
});
