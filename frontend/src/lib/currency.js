const priceFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${priceFormatter.format(number)} TJS`;
}
