import { ArrowRight, Pill } from "lucide-react";
import { Link } from "react-router-dom";
import { mediaUrl } from "../api/axios";
import { Card, CardContent } from "./ui/Card";

export default function MedicineCard({ medicine }) {
  return <Card className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"><div className="grid h-40 place-items-center bg-gradient-to-br from-emerald-50 to-slate-50">{medicine.image ? <img src={mediaUrl(medicine.image)} alt={medicine.name} className="h-full w-full object-cover" /> : <Pill className="size-12 text-emerald-300" />}</div><CardContent><h3 className="text-lg font-semibold text-slate-900">{medicine.name}</h3><p className="mt-1 text-sm text-slate-500">{[medicine.dosage, medicine.form].filter(Boolean).join(" · ") || "Характеристики не указаны"}</p>{medicine.active_ingredient && <p className="mt-3 text-sm"><span className="text-slate-400">Действующее вещество:</span> <span className="text-slate-700">{medicine.active_ingredient}</span></p>}{medicine.manufacturer && <p className="mt-1 text-sm text-slate-500">{medicine.manufacturer}</p>}<Link to={`/medicines/${medicine.id}`} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-emerald-700 group-hover:text-emerald-900">Где купить <ArrowRight className="size-4" /></Link></CardContent></Card>;
}
