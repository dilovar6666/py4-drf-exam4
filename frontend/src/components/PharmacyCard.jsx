import { Clock3, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { pharmacyHours } from "../lib/pharmacy";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { Card, CardContent } from "./ui/Card";

export default function PharmacyCard({ pharmacy, selected = false, onSelect, offer }) {
  return <Card id={`pharmacy-card-${pharmacy.id}`} className={cn("group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg", selected && "border-teal-500 ring-4 ring-teal-50 shadow-lg shadow-teal-800/10")}><CardContent className="p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold text-slate-950">{pharmacy.name}</h3>{pharmacy.is_24_hours && <Badge variant="teal">24/7</Badge>}</div><p className="mt-2 flex gap-2 text-sm leading-5 text-slate-500"><MapPin className="mt-0.5 size-4 shrink-0 text-teal-600" />{pharmacy.address}</p><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5 text-teal-600" />{pharmacyHours(pharmacy)}</span>{pharmacy.rating && <span className="flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" />{pharmacy.rating.toFixed(1)} <span className="text-slate-400">({pharmacy.reviewCount})</span></span>}</div></div>{offer && <div className="shrink-0 text-right"><strong className="block text-lg font-extrabold text-slate-950">{offer.price} ₼</strong><span className={`text-xs font-semibold ${offer.quantity > 0 ? "text-emerald-700" : "text-red-600"}`}>{offer.quantity > 0 ? `${offer.quantity} шт.` : "Нет"}</span></div>}</div><div className="mt-4 flex items-center gap-2"><Button onClick={() => onSelect?.(pharmacy.id)} variant={selected ? "soft" : "secondary"} size="sm" className="flex-1">{selected ? "Выбрано на карте" : "Показать на карте"}</Button><Button asChild variant="ghost" size="sm"><Link to={`/pharmacies/${pharmacy.id}`}>Подробнее</Link></Button></div></CardContent></Card>;
}
