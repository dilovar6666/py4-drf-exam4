import { divIcon } from "leaflet";
import { LocateFixed, MapPinned } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { pharmacyHours } from "../lib/pharmacy";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import PageState from "./ui/PageState";

function makeIcon(selected, allDay) {
  return divIcon({ className: "", iconSize: selected ? [48, 48] : [38, 38], iconAnchor: selected ? [24, 44] : [19, 36], popupAnchor: [0, selected ? -42 : -35], html: `<div class="pharmacy-pin ${selected ? "is-selected" : ""} ${allDay ? "is-all-day" : ""}"><span>+</span></div>` });
}

function MapSelection({ pharmacy }) {
  const map = useMap();
  useEffect(() => { if (pharmacy) map.flyTo([Number(pharmacy.latitude), Number(pharmacy.longitude)], Math.max(map.getZoom(), 14), { duration: 0.7 }); }, [map, pharmacy]);
  return null;
}

function LocationControl() {
  const map = useMap();
  function locate() { navigator.geolocation?.getCurrentPosition(({ coords }) => map.flyTo([coords.latitude, coords.longitude], 14, { duration: .8 })); }
  return <div className="absolute bottom-24 right-3 z-[500]"><Button onClick={locate} variant="secondary" size="icon" aria-label="Моё местоположение" className="rounded-xl bg-white shadow-lg"><LocateFixed className="size-5" /></Button></div>;
}

export default function PharmacyMap({ pharmacies, selectedPharmacyId, onSelect, className = "h-[560px]", single = false, offers = {} }) {
  const refs = useRef(new Map());
  const valid = useMemo(() => pharmacies.filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))), [pharmacies]);
  const selected = valid.find((item) => item.id === selectedPharmacyId);
  useEffect(() => { if (selectedPharmacyId) refs.current.get(selectedPharmacyId)?.openPopup(); }, [selectedPharmacyId]);
  if (!valid.length) return <div className={`grid rounded-[1.5rem] border border-slate-200 bg-slate-100 ${className}`}><PageState type="empty" message="Пока нет аптек для отображения" compact /></div>;
  const center = [Number((selected || valid[0]).latitude), Number((selected || valid[0]).longitude)];
  return <div className={`relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 shadow-[0_20px_60px_rgba(15,118,110,.10)] ${className}`}><MapContainer center={center} zoom={single ? 15 : 12} scrollWheelZoom zoomControl className="z-0 size-full"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapSelection pharmacy={selected} /><LocationControl />{valid.map((pharmacy) => { const offer = offers[pharmacy.id]; return <Marker key={pharmacy.id} position={[Number(pharmacy.latitude), Number(pharmacy.longitude)]} icon={makeIcon(pharmacy.id === selectedPharmacyId, pharmacy.is_24_hours)} eventHandlers={{ click: () => onSelect?.(pharmacy.id) }} ref={(marker) => marker ? refs.current.set(pharmacy.id, marker) : refs.current.delete(pharmacy.id)}><Popup><div className="min-w-56"><div className="flex items-center justify-between gap-3"><strong className="text-base text-slate-950">{pharmacy.name}</strong>{pharmacy.is_24_hours && <Badge variant="teal">24/7</Badge>}</div><p className="mt-2 flex gap-1.5 text-sm leading-5 text-slate-600"><MapPinned className="mt-0.5 size-3.5 shrink-0 text-teal-600" />{pharmacy.address}</p><p className="mt-2 text-xs font-semibold text-emerald-700">{pharmacyHours(pharmacy)}</p>{offer && <div className="mt-3 flex items-end justify-between rounded-xl bg-teal-50 p-3"><span className="text-xs text-teal-800">В наличии<br /><b>{offer.quantity} шт.</b></span><strong className="text-lg text-teal-950">{offer.price} ₼</strong></div>}<Link className="mt-3 inline-flex font-bold text-teal-700 hover:text-teal-900" to={`/pharmacies/${pharmacy.id}`}>Открыть аптеку →</Link></div></Popup></Marker>; })}</MapContainer></div>;
}
