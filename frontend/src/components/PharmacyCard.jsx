import { Clock3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../lib/currency";
import { pharmacyHours } from "../lib/pharmacy";
import { cn } from "../lib/utils";
import StarRating from "./StarRating";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { Card, CardContent } from "./ui/Card";

export default function PharmacyCard({ pharmacy, selected = false, onSelect, offer }) {
  const { t } = useTranslation(); const rating = Number(pharmacy.rating);
  return <Card id={`pharmacy-card-${pharmacy.id}`} className={cn("group cursor-pointer transition-all duration-200 hover:border-teal-200 hover:shadow-md", selected && "border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/15")} onClick={() => onSelect?.(pharmacy.id)}><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold text-slate-950">{pharmacy.name}</h3>{pharmacy.is_24_hours && <Badge variant="teal">24/7</Badge>}</div><p className="mt-2 flex gap-2 text-sm leading-5 text-slate-500"><MapPin className="mt-0.5 size-4 shrink-0 text-teal-600" />{pharmacy.address}</p><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5 text-teal-600" />{pharmacyHours(pharmacy, t)}</span>{Number.isFinite(rating) && <StarRating value={rating} count={pharmacy.review_count || 0} size="sm" />}</div></div>{offer && <div className="shrink-0 text-right"><strong className="block text-base font-extrabold text-slate-950">{formatPrice(offer.price)}</strong><span className={`text-xs font-semibold ${offer.quantity > 0 ? "text-emerald-700" : "text-red-600"}`}>{offer.quantity > 0 ? `${offer.quantity} ${t("common.quantity")}` : t("common.unavailable")}</span></div>}</div><div className="mt-4 flex items-center gap-2"><Button type="button" variant={selected ? "soft" : "secondary"} size="sm" className="flex-1">{selected ? t("common.confirm") : t("map.fit")}</Button><Button asChild variant="ghost" size="sm" onClick={(event) => event.stopPropagation()}><Link to={`/pharmacies/${pharmacy.id}`}>{t("common.details")}</Link></Button></div></CardContent></Card>;
}
