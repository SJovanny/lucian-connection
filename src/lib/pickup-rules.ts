export const PICKUP_TIME_ZONE = "America/Martinique";
export const PICKUP_LEAD_MINUTES = 30;
export const PICKUP_BOOKING_DAYS = 7;
export const PICKUP_START_MINUTES = 9 * 60;
export const PICKUP_END_MINUTES = 18 * 60;
export const PICKUP_INTERVAL_MINUTES = 30;

export type PickupOpeningHour = {
  weekday: number;
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
};

export const DEFAULT_PICKUP_OPENING_HOURS: PickupOpeningHour[] = [
  { weekday: 0, is_open: false, start_time: null, end_time: null },
  ...Array.from({ length: 5 }, (_, index) => ({ weekday: index + 1, is_open: true, start_time: "09:00", end_time: "18:00" })),
  { weekday: 6, is_open: true, start_time: "08:00", end_time: "13:00" },
];

export type PickupDayState = "available" | "weekend" | "closed" | "no_slots";

export type PickupSlot = {
  time: string;
  pickupAt: string;
};

export type PickupDay = {
  date: string;
  state: PickupDayState;
  slots: PickupSlot[];
};

type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const localFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: PICKUP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getLocalParts(date: Date): LocalParts {
  const values = Object.fromEntries(
    localFormatter.formatToParts(date).map(({ type, value }) => [type, Number(value)])
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addCalendarDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getWeekday(dateKey: string): number {
  return new Date(`${dateKey}T12:00:00Z`).getUTCDay();
}

function getTimeZoneOffsetMinutes(instant: Date): number {
  const parts = getLocalParts(instant);
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return (localAsUtc - instant.getTime()) / 60000;
}

export function localPickupToDate(dateKey: string, minutes: number): Date {
  const hours = Math.floor(minutes / 60);
  const localAsUtc = new Date(
    Date.UTC(
      Number(dateKey.slice(0, 4)),
      Number(dateKey.slice(5, 7)) - 1,
      Number(dateKey.slice(8, 10)),
      hours,
      minutes % 60
    )
  );
  const offset = getTimeZoneOffsetMinutes(localAsUtc);
  return new Date(localAsUtc.getTime() - offset * 60000);
}

export function getLocalDateKey(date: Date = new Date()): string {
  const parts = getLocalParts(date);
  return toDateKey(parts.year, parts.month, parts.day);
}

export function isValidClosureDate(dateKey: unknown, now: Date = new Date()): dateKey is string {
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const parsed = new Date(`${dateKey}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dateKey) return false;
  return dateKey > getLocalDateKey(now) && getWeekday(dateKey) >= 1 && getWeekday(dateKey) <= 5;
}

export function getPickupAvailability(
  now: Date = new Date(),
  closedDates: Iterable<string> = [],
  openingHours: Iterable<PickupOpeningHour> = DEFAULT_PICKUP_OPENING_HOURS
): PickupDay[] {
  const today = getLocalDateKey(now);
  const closed = new Set(closedDates);
  const hoursByWeekday = new Map(Array.from(openingHours, (hours) => [hours.weekday, hours]));
  const minimumPickupTime = now.getTime() + PICKUP_LEAD_MINUTES * 60_000;

  return Array.from({ length: PICKUP_BOOKING_DAYS }, (_, dayIndex) => {
    const date = addCalendarDays(today, dayIndex);
    const weekday = getWeekday(date);

    const hours = hoursByWeekday.get(weekday);
    if (!hours?.is_open || !hours.start_time || !hours.end_time) {
      return { date, state: "weekend", slots: [] };
    }
    if (closed.has(date)) {
      return { date, state: "closed", slots: [] };
    }

    const [startHour, startMinute] = hours.start_time.split(":").map(Number);
    const [endHour, endMinute] = hours.end_time.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const slots: PickupSlot[] = [];
    for (
      let minutes = startMinutes;
      minutes <= endMinutes;
      minutes += PICKUP_INTERVAL_MINUTES
    ) {
      const pickupAt = localPickupToDate(date, minutes);
      if (pickupAt.getTime() >= minimumPickupTime) {
        slots.push({
          time: `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
          pickupAt: pickupAt.toISOString(),
        });
      }
    }

    return {
      date,
      state: slots.length > 0 ? "available" : "no_slots",
      slots,
    };
  });
}

export function validatePickupAt(
  value: unknown,
  now: Date = new Date(),
  closedDates: Iterable<string> = [],
  openingHours: Iterable<PickupOpeningHour> = DEFAULT_PICKUP_OPENING_HOURS
): boolean {
  if (typeof value !== "string" || !value.trim()) return false;

  const pickupAt = new Date(value);
  if (Number.isNaN(pickupAt.getTime())) return false;

  return getPickupAvailability(now, closedDates, openingHours).some((day) =>
    day.slots.some((slot) => slot.pickupAt === pickupAt.toISOString())
  );
}
