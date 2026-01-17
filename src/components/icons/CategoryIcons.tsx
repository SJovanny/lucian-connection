import {
  UtensilsCrossed,
  Sparkles,
  Users,
  Home,
  GlassWater,
  ShoppingCart,
  Package,
  type LucideIcon,
} from "lucide-react";

// Map des icônes par ID de groupe de catégorie
export const categoryGroupIcons: Record<string, LucideIcon> = {
  alimentation: UtensilsCrossed,
  "beaute-soins": Sparkles,
  famille: Users,
  maison: Home,
  boissons: GlassWater,
};

// Icône par défaut pour "Tous les produits" et placeholder
export const AllProductsIcon = ShoppingCart;
export const PlaceholderProductIcon = Package;

interface CategoryIconProps {
  groupId: string;
  className?: string;
}

export function CategoryIcon({ groupId, className = "w-5 h-5" }: CategoryIconProps) {
  const Icon = categoryGroupIcons[groupId] || Package;
  return <Icon className={className} />;
}
