"use client";

import { useEffect, useState } from "react";
import type { PickupDay } from "@/lib/pickup-rules";

type PickupSlotPickerProps = {
  locale?: string;
  value: string | null;
  onChange: (pickupAt: string | null) => void;
  reloadToken?: number;
};

export function PickupSlotPicker({
  locale = "fr",
  value,
  onChange,
  reloadToken = 0,
}: PickupSlotPickerProps) {
  const [days, setDays] = useState<PickupDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAvailability = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pickup-availability", { cache: "no-store" });
      if (!response.ok) throw new Error("availability");
      const data = await response.json() as { days: PickupDay[] };
      setDays(data.days);
      setSelectedDate((current) =>
        current && data.days.some((day) => day.date === current) ? current : data.days[0]?.date || null
      );
    } catch {
      setError(locale === "fr" ? "Les créneaux sont temporairement indisponibles." : "Pickup slots are temporarily unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
    // reloadToken intentionally refreshes the server-generated availability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken]);

  const selectedDay = days.find((day) => day.date === selectedDate);
  const dateFormatter = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    timeZone: "America/Martinique",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const labels = locale === "fr"
    ? { title: "Choisissez votre créneau de retrait", loading: "Chargement des créneaux...", closed: "Fermé", weekend: "Week-end", noSlots: "Plus de créneau" }
    : { title: "Choose your pickup slot", loading: "Loading pickup slots...", closed: "Closed", weekend: "Weekend", noSlots: "No slots left" };

  return (
    <div className="space-y-4" aria-live="polite">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{labels.title}</h2>
        <p className="text-sm text-gray-500">
          {locale === "fr" ? "Retrait en magasin, du lundi au vendredi." : "In-store pickup, Monday to Friday."}
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">{labels.loading}</p>
      ) : error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {days.map((day) => {
              const disabled = day.state !== "available";
              const stateLabel = day.state === "closed" ? labels.closed : day.state === "weekend" ? labels.weekend : labels.noSlots;
              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selectedDate === day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`min-h-16 rounded-lg border px-2 py-2 text-sm transition-colors ${
                    selectedDate === day.date
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : disabled
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                  }`}
                  aria-label={`${dateFormatter.format(new Date(`${day.date}T12:00:00Z`))}${disabled ? `, ${stateLabel}` : ""}`}
                >
                  <span className="block font-semibold capitalize">
                    {dateFormatter.format(new Date(`${day.date}T12:00:00Z`))}
                  </span>
                  {disabled && <span className="mt-1 block text-xs">{stateLabel}</span>}
                </button>
              );
            })}
          </div>

          {selectedDay && selectedDay.slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
              {selectedDay.slots.map((slot) => (
                <button
                  key={slot.pickupAt}
                  type="button"
                  aria-pressed={value === slot.pickupAt}
                  onClick={() => onChange(value === slot.pickupAt ? null : slot.pickupAt)}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                    value === slot.pickupAt
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}
