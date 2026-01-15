import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "outline";
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-800",
      primary: "bg-primary-100 text-primary-800",
      accent: "bg-accent-100 text-accent-800",
      success: "bg-success-50 text-success-600",
      warning: "bg-warning-50 text-warning-600",
      error: "bg-error-50 text-error-600",
      outline: "bg-transparent border border-gray-300 text-gray-700",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium rounded-full",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

// Status badge for orders
export interface StatusBadgeProps {
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
}

const statusConfig = {
  pending: { variant: "warning" as const, label: { fr: "En attente", en: "Pending" } },
  confirmed: { variant: "primary" as const, label: { fr: "Confirmée", en: "Confirmed" } },
  preparing: { variant: "accent" as const, label: { fr: "En préparation", en: "Preparing" } },
  ready: { variant: "success" as const, label: { fr: "Prête", en: "Ready" } },
  delivered: { variant: "success" as const, label: { fr: "Livrée", en: "Delivered" } },
  cancelled: { variant: "error" as const, label: { fr: "Annulée", en: "Cancelled" } },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label.fr}</Badge>;
}

// Stock badge for inventory
export interface StockBadgeProps {
  stock: number;
  lowStockThreshold: number;
}

export function StockBadge({ stock, lowStockThreshold }: StockBadgeProps) {
  if (stock === 0) {
    return <Badge variant="error">Rupture</Badge>;
  }
  if (stock <= lowStockThreshold) {
    return <Badge variant="warning">Stock bas ({stock})</Badge>;
  }
  return <Badge variant="success">En stock ({stock})</Badge>;
}

export { Badge };
