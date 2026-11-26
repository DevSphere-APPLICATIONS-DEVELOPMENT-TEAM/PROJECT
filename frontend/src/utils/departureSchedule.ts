/**
 * Shared helpers for departure date/time parsing, validation, serialisation
 * and consistent display formatting.
 */

/** Pad a number to 2 digits */
const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Build a Date from a date string (YYYY-MM-DD from <input type="date">)
 * and a time string (HH:mm from <input type="time">), treating them as
 * Asia/Kuala_Lumpur (UTC+8).
 */
export const buildDepartureDate = (
  dateStr: string,
  timeStr: string
): Date | null => {
  if (!dateStr || !timeStr) return null;
  const iso = `${dateStr}T${timeStr}:00+08:00`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

/** Returns true when the given Date is strictly in the future. */
export const isFutureDeparture = (d: Date): boolean => d.getTime() > Date.now();

/**
 * Format a Date (or ISO string) into a human-readable departure date,
 * e.g. "27/11/2026".
 */
export const formatDepartureDate = (value: string | Date): string => {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return typeof value === 'string' ? value : '';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/**
 * Format a Date (or ISO string) into a human-readable departure time,
 * e.g. "8:00 AM".
 */
export const formatDepartureTime = (value: string | Date): string => {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return typeof value === 'string' ? value : '';
  let hh = d.getHours();
  const mm = d.getMinutes();
  const period = hh >= 12 ? 'PM' : 'AM';
  if (hh === 0) hh = 12;
  else if (hh > 12) hh -= 12;
  return `${hh}:${pad(mm)} ${period}`;
};

/**
 * Convert a date (YYYY-MM-DD) + time (HH:mm) pair into the display string
 * "DD/MM/YYYY" used by the Ride model's departureDate field.
 */
export const toDisplayDate = (dateStr: string): string => {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Convert a time (HH:mm from input) into the display string "h:mm AM/PM"
 * used by the Ride model's departureTime field.
 */
export const toDisplayTime = (timeStr: string): string => {
  const [hhStr, mmStr] = timeStr.split(':');
  let hh = Number(hhStr);
  const mm = mmStr;
  const period = hh >= 12 ? 'PM' : 'AM';
  if (hh === 0) hh = 12;
  else if (hh > 12) hh -= 12;
  return `${hh}:${mm} ${period}`;
};

/**
 * Smart formatter: if a ride has departureAt (ISO), use that for display;
 * otherwise fall back to the raw string fields.
 */
export const displayDepartureDate = (ride: {
  departureAt?: string | null;
  departureDate: string;
}): string => {
  if (ride.departureAt) return formatDepartureDate(ride.departureAt);
  return ride.departureDate;
};

export const displayDepartureTime = (ride: {
  departureAt?: string | null;
  departureTime: string;
}): string => {
  if (ride.departureAt) return formatDepartureTime(ride.departureAt);
  return ride.departureTime;
};
