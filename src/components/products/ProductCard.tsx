"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { useCartStore } from "@/store/cartStore";
import { Plus, Minus } from "lucide-react";
import { formatPriceParts } from "@/lib/utils";
import { Locale } from "@/i18n/routing";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: { fr: string; en: string };
    description: { fr: string; en: string };
    price: number;
    image_url: string | null;
    category: { fr: string; en: string };
    stock: number;
    unit: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("products");
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const { whole, decimal } = formatPriceParts(product.price);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      name: product.name[locale],
      price: product.price,
      image_url: product.image_url,
      unit: product.unit,
    });
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      updateQuantity(product.id, quantity + 1);
    }
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
      <div className="relative h-32 sm:h-40 bg-gray-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name[locale]}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="text-5xl opacity-50">🛒</div>
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
          {product.name[locale]}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 text-center mt-0.5">
          ({product.category[locale]})
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          {product.unit}
        </p>

        {/* Price */}
        <div className="flex items-baseline justify-center mt-3 mb-3">
          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
            {whole}
          </span>
          <span className="text-base sm:text-lg font-bold text-gray-900">
            .{decimal}$
          </span>
        </div>

        {/* Add to cart button */}
        <div className="mt-auto">
          {quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full h-12 bg-gray-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={quantity >= product.stock}
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
