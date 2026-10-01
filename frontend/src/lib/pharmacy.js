export function pharmacyHours(pharmacy) {
  if (pharmacy.is_24_hours) return "Круглосуточно";
  if (!pharmacy.opening_time && !pharmacy.closing_time) return "График не указан";
  return `${pharmacy.opening_time?.slice(0, 5) || "—"}–${pharmacy.closing_time?.slice(0, 5) || "—"}`;
}
