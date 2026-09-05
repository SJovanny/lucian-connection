import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PICKUP_ADDRESS,
  PICKUP_GOOGLE_MAPS_URL,
  PICKUP_WAZE_URL,
} from "@/lib/pickup-location";

type PickupLocationProps = {
  compact?: boolean;
  className?: string;
};

export function PickupLocation({ compact = false, className }: PickupLocationProps) {
  const t = useTranslations("pickup");

  return (
    <div
      className={cn(
        compact ? "space-y-3" : "space-y-4 rounded-xl border border-primary-100 bg-primary-50/60 p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <MapPin className={cn("mt-0.5 h-5 w-5 shrink-0", compact ? "text-accent-400" : "text-primary-600")} />
        <div className="min-w-0">
          <p className={cn("font-semibold", compact ? "text-white" : "text-gray-900")}>
            {t("title")}
          </p>
          <a
            href={PICKUP_GOOGLE_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "break-words text-sm underline-offset-2 hover:underline",
              compact ? "text-primary-200 hover:text-white" : "text-gray-600 hover:text-primary-700"
            )}
          >
            {PICKUP_ADDRESS}
          </a>
          {!compact && <p className="mt-1 text-sm text-gray-500">{t("description")}</p>}
        </div>
      </div>

      <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", compact ? "text-primary-200" : "text-gray-600")}>
        <span>{t("directions")}</span>
        <a
          href={PICKUP_GOOGLE_MAPS_URL}
          target="_blank"
          rel="noreferrer"
          className={cn("font-medium underline underline-offset-2 hover:no-underline", compact ? "text-white" : "text-primary-700")}
        >
          {t("googleMaps")}
        </a>
        <span aria-hidden="true">·</span>
        <a
          href={PICKUP_WAZE_URL}
          target="_blank"
          rel="noreferrer"
          className={cn("font-medium underline underline-offset-2 hover:no-underline", compact ? "text-white" : "text-primary-700")}
        >
          {t("waze")}
        </a>
      </div>
    </div>
  );
}
