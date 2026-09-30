import { Clock, MapPin, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/Card";

export default function PharmacyCard({ pharmacy }) {
  const hours = pharmacy.is_24_hours ? "24/7" : pharmacy.opening_time || pharmacy.closing_time ? `${pharmacy.opening_time?.slice(0, 5) || "—"}–${pharmacy.closing_time?.slice(0, 5) || "—"}` : "График не указан";
  return <Card className="transition hover:-translate-y-0.5 hover:shadow-md"><CardContent><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{pharmacy.name}</h3><p className="mt-2 flex gap-2 text-sm text-slate-500"><MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />{pharmacy.address}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Clock className="size-4 text-emerald-600" />{hours}</p></div>{pharmacy.is_24_hours && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">24/7</span>}</div><Link to={`/pharmacies/${pharmacy.id}`} className="focus-ring mt-4 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-emerald-700 hover:text-emerald-900">Подробнее <MoveRight className="size-4" /></Link></CardContent></Card>;
}
