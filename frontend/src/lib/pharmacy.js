export function pharmacyHours(pharmacy, t) {
  if (pharmacy.is_24_hours) return t?.("common.allDay") || "24/7";
  if (!pharmacy.opening_time && !pharmacy.closing_time) return t?.("common.hours") || "—";
  return `${pharmacy.opening_time?.slice(0, 5) || "—"}–${pharmacy.closing_time?.slice(0, 5) || "—"}`;
}
