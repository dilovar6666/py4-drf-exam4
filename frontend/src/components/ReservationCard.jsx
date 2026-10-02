import { CalendarDays, Clock3, MapPin, PackageCheck, Pill, XCircle } from "lucide-react";
import { formatPrice } from "../lib/currency";
import { useTranslation } from "react-i18next";
import StatusBadge from "./StatusBadge";
import Button from "./ui/Button";
import { Card, CardContent } from "./ui/Card";

export default function ReservationCard({ booking, role = "user", onStatus, busy }) {
  const { t, i18n } = useTranslation();
  const nextStatus = { pending: ["confirmed", t("common.confirmAction")], confirmed: ["ready", t("common.readyAction")], ready: ["completed", t("common.completeAction")] };
  const locale = i18n.language === "tj" ? "tg-TJ" : i18n.language === "en" ? "en-US" : "ru-RU";
  const active = ["pending", "confirmed", "ready"].includes(booking.status);
  const canManage = role === "pharmacist" || role === "staff";
  const next = nextStatus[booking.status];
  return <Card className="transition hover:border-teal-200 hover:shadow-lg"><CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div className="flex gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Pill className="size-6" /></span><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-extrabold text-slate-950">{booking.medicine?.name || t("common.medicine")}</h2><StatusBadge status={booking.status} /></div><p className="mt-2 flex items-start gap-2 text-sm text-slate-500"><MapPin className="mt-0.5 size-4 shrink-0 text-teal-600" />{booking.pharmacy?.name || t("common.pharmacy")}{booking.pharmacy?.address ? ` · ${booking.pharmacy.address}` : ""}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500"><span className="flex items-center gap-1.5"><PackageCheck className="size-4" />{booking.quantity} {t("common.pieces")}</span><span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{new Date(booking.created_at).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}</span>{booking.expires_at && <span className="flex items-center gap-1.5"><Clock3 className="size-4" />{t("reservation.until")} {new Date(booking.expires_at).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}</span>}</div></div></div><div className="grid justify-items-end gap-3">{booking.stock?.price && <div className="rounded-2xl bg-slate-50 px-5 py-3 text-right"><p className="text-xs font-medium text-slate-400">{t("reservation.total")}</p><strong className="text-xl font-extrabold text-slate-950">{formatPrice(Number(booking.stock.price) * booking.quantity)}</strong></div>}{active && <div className="flex flex-wrap justify-end gap-2">{canManage && next && <Button size="sm" onClick={() => onStatus(booking, next[0])} disabled={busy}>{next[1]}</Button>}<Button size="sm" variant="ghost" onClick={() => onStatus(booking, "cancelled")} disabled={busy}><XCircle className="size-4" />{t("common.cancel")}</Button></div>}</div></CardContent></Card>;
}
