"use client";

import { useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { useCartStore } from "@/store/cartStore";
import { Plus, Minus, Package } from "lucide-react";
import { formatPriceParts } from "@/lib/utils";
import { Locale } from "@/i18n/routing";
import type { ProductWithCategory } from "@/lib/supabase/queries";
import type { CategoryTranslations } from "@/types/database.types";

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("products");
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Récupérer les traductions du produit
  const translations = product.translations;
  const productName = translations?.[locale]?.name || product.slug;
  const productDescription = translations?.[locale]?.description || "";
  
  // Récupérer les traductions de la catégorie
  const categoryTranslations = product.categories?.translations as CategoryTranslations | undefined;
  const categoryName = categoryTranslations?.[locale]?.name || product.categories?.slug || "";
  
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const discountedPrice = product.discounted_price ?? null;
  const displayPrice = discountedPrice !== null && discountedPrice < product.price
    ? discountedPrice
    : product.price;
  const hasDiscount = discountedPrice !== null && discountedPrice < product.price;
  const { whole, decimal } = formatPriceParts(displayPrice);
  // TODO: Réactiver quand on aura les données de stock
  // const isOutOfStock = product.stock === 0;
  const isOutOfStock = false;

  const animateToCart = () => {
    const cartIcon = document.getElementById("cart-icon-container");
    const image = imageRef.current;

    if (!cartIcon || !image) return;

    const imageRect = image.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const flyingImage = image.cloneNode() as HTMLImageElement;
    
    // Style de départ (sur l'image actuelle)
    flyingImage.style.position = "fixed";
    flyingImage.style.left = `${imageRect.left}px`;
    flyingImage.style.top = `${imageRect.top}px`;
    flyingImage.style.width = `${imageRect.width}px`;
    flyingImage.style.height = `${imageRect.height}px`;
    flyingImage.style.zIndex = "9999";
    flyingImage.style.pointerEvents = "none";
    flyingImage.style.transition = "all 1.5s cubic-bezier(0.2, 1, 0.2, 1)";
    flyingImage.style.borderRadius = "12px";
    flyingImage.style.objectFit = "contain";

    document.body.appendChild(flyingImage);

    // Force reflow
    void flyingImage.offsetWidth;

    // Calculer la position cible (centre du panier)
    const targetSize = 30; // Taille finale de l'image
    const targetX = cartRect.left + (cartRect.width / 2) - (targetSize / 2);
    const targetY = cartRect.top + (cartRect.height / 2) - (targetSize / 2);

    // Style de destination
    flyingImage.style.left = `${targetX}px`;
    flyingImage.style.top = `${targetY}px`;
    flyingImage.style.width = `${targetSize}px`;
    flyingImage.style.height = `${targetSize}px`;
    flyingImage.style.opacity = "0";

    // Nettoyage après l'animation
    flyingImage.addEventListener("transitionend", () => {
      if (document.body.contains(flyingImage)) {
        document.body.removeChild(flyingImage);
      }
    }, { once: true });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    animateToCart();
    addItem({
      id: product.id,
      name: productName,
      price: displayPrice,
      image_url: product.image_url,
      unit: product.unit,
    });
  };

  const handleIncrement = () => {
    // TODO: Réactiver la limite de stock quand disponible
    // if (quantity < product.stock) {
    updateQuantity(product.id, quantity + 1);
    // }
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <Card
      variant="default"
      padding="md"
      className="group hover:shadow-lg transition-all duration-200 flex flex-col"
    >
      {/* Image container */}
      <div className="relative h-32 sm:h-40 bg-white rounded-xl mb-3 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            ref={imageRef}
            src={product.image_url}
            alt={productName}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">
              {t("outOfStock")}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-center text-sm sm:text-base line-clamp-1">
          {productName}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 text-center mt-0.5">
          ({categoryName})
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          {product.unit}
        </p>

        {/* Price */}
        <div className="flex flex-col items-center justify-center mt-3 mb-3">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {product.price.toFixed(2)}€
            </span>
          )}
          <div className="flex items-baseline justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
            {whole}
          </span>
          <span className="text-base sm:text-lg font-bold text-gray-900">
            .{decimal}€
          </span>
          </div>
        </div>

        {/* Add to cart button */}
        <div className="mt-auto">
          {quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full h-12 bg-gray-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-press active:bg-primary-200"
            >
              <Plus className="w-6 h-6 text-gray-700" />
            </button>
          ) : (
            <div className="w-full h-12 bg-primary-500 rounded-xl flex items-center justify-between px-2">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center text-white hover:bg-primary-400 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-white font-bold text-lg">{quantity}</span>
              <button
                onClick={handleIncrement}
                // TODO: Réactiver la limite de stock quand disponible
                // disabled={quantity >= product.stock}
                className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center text-white hover:bg-primary-400 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
