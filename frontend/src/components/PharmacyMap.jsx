import { divIcon, latLngBounds } from "leaflet";
import { LocateFixed, MapPinned, Maximize2, Minus, Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { formatPrice } from "../lib/currency";
import { pharmacyHours } from "../lib/pharmacy";
import { cn } from "../lib/utils";
import Badge from "./ui/Badge";
import PageState from "./ui/PageState";

function markerIcon(selected, allDay) {
  return divIcon({ className: "", iconSize: selected ? [52, 58] : [40, 46], iconAnchor: selected ? [26, 54] : [20, 43], popupAnchor: [0, -45], html: `<div class="pharmacy-pin ${selected ? "is-selected" : ""} ${allDay ? "is-all-day" : ""}"><span>+</span>${allDay ? '<i aria-hidden="true"></i>' : ""}</div>` });
}

function MapSync({ selected, pharmacies }) {
  const map = useMap();
  useEffect(() => { if (selected) map.flyTo([Number(selected.latitude), Number(selected.longitude)], Math.max(map.getZoom(), 15), { duration: .65 }); }, [map, selected]);
  return <MapControls pharmacies={pharmacies} />;
}

function MapControls({ pharmacies }) {
  const map = useMap();
  function locate() { navigator.geolocation?.getCurrentPosition(({ coords }) => map.flyTo([coords.latitude, coords.longitude], 15, { duration: .7 })); }
  function fitAll() { if (pharmacies.length) map.fitBounds(latLngBounds(pharmacies.map((item) => [Number(item.latitude), Number(item.longitude)])), { padding: [48, 48] }); }
  const control = "grid size-10 place-items-center border-b border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-teal-700 last:border-b-0";
  return <div className="absolute right-3 top-1/2 z-[500] -translate-y-1/2 overflow-hidden rounded-xl border border-slate-200 shadow-[0_8px_28px_rgba(15,23,42,.18)]"><button className={control} onClick={() => map.zoomIn()} aria-label="Приблизить"><Plus className="size-5" /></button><button className={control} onClick={() => map.zoomOut()} aria-label="Отдалить"><Minus className="size-5" /></button><button className={control} onClick={locate} aria-label="Моё местоположение"><LocateFixed className="size-5" /></button><button className={control} onClick={fitAll} aria-label="Показать все аптеки"><Maximize2 className="size-5" /></button></div>;
}

export default function PharmacyMap({ pharmacies, selectedPharmacyId, onSelect, className = "h-[560px]", single = false, offers = {}, variant = "card" }) {
  const valid = useMemo(() => pharmacies.filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))), [pharmacies]);
  const selected = valid.find((item) => item.id === selectedPharmacyId);
  if (!valid.length) return <div className={cn("grid bg-slate-100", variant === "card" && "rounded-[1.5rem] border border-slate-200", className)}><PageState type="empty" message="Пока нет аптек для отображения" compact /></div>;
  const center = [Number((selected || valid[0]).latitude), Number((selected || valid[0]).longitude)];
  return <div className={cn("relative overflow-hidden bg-slate-100", variant === "card" && "rounded-[1.5rem] border border-slate-200 shadow-[0_20px_60px_rgba(15,118,110,.10)]", className)}><MapContainer center={center} zoom={single ? 15 : 13} scrollWheelZoom zoomControl={false} className="z-0 size-full"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" /><MapSync selected={selected} pharmacies={valid} />{valid.map((pharmacy) => { const offer = offers[pharmacy.id]; return <Marker key={pharmacy.id} position={[Number(pharmacy.latitude), Number(pharmacy.longitude)]} icon={markerIcon(pharmacy.id === selectedPharmacyId, pharmacy.is_24_hours)} zIndexOffset={pharmacy.id === selectedPharmacyId ? 1000 : 0} eventHandlers={{ click: () => onSelect?.(pharmacy.id) }}><Popup><div className="min-w-52"><div className="flex items-center justify-between gap-2"><strong>{pharmacy.name}</strong>{pharmacy.is_24_hours && <Badge variant="teal">24/7</Badge>}</div><p className="mt-2 flex gap-1.5 text-sm text-slate-600"><MapPinned className="mt-0.5 size-3.5 shrink-0 text-teal-600" />{pharmacy.address}</p><p className="mt-2 text-xs font-semibold text-emerald-700">{pharmacyHours(pharmacy)}</p>{offer && <p className="mt-2 font-extrabold text-teal-800">{formatPrice(offer.price)} · {offer.quantity} шт.</p>}<Link className="mt-3 inline-flex font-bold text-teal-700" to={`/pharmacies/${pharmacy.id}`}>Подробнее →</Link></div></Popup></Marker>; })}</MapContainer></div>;
}
