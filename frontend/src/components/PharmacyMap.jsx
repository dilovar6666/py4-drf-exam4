import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import PageState from "./ui/PageState";

const markerIcon = divIcon({
  className: "",
  html: '<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#047857;border:3px solid white;box-shadow:0 3px 12px #0003;display:grid;place-items:center"><span style="transform:rotate(45deg);color:white;font-size:15px">+</span></div>',
  iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -34],
});

function hours(pharmacy) {
  if (pharmacy.is_24_hours) return "Круглосуточно";
  if (!pharmacy.opening_time && !pharmacy.closing_time) return "Время работы не указано";
  return `${pharmacy.opening_time?.slice(0, 5) || "—"}–${pharmacy.closing_time?.slice(0, 5) || "—"}`;
}

export default function PharmacyMap({ pharmacies, className = "h-[430px]", single = false }) {
  const valid = pharmacies.filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)));
  if (!valid.length) return <div className={`grid rounded-2xl border border-slate-200 bg-slate-50 ${className}`}><PageState type="empty" message="У аптек пока нет координат" compact /></div>;
  const center = [Number(valid[0].latitude), Number(valid[0].longitude)];
  return <MapContainer center={center} zoom={single ? 15 : 12} scrollWheelZoom className={`z-0 rounded-2xl border border-slate-200 ${className}`}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />{valid.map((pharmacy) => <Marker key={pharmacy.id} position={[Number(pharmacy.latitude), Number(pharmacy.longitude)]} icon={markerIcon}><Popup><div className="min-w-48"><strong className="text-base text-slate-900">{pharmacy.name}</strong><p className="mt-2 flex gap-1.5 text-sm text-slate-600"><MapPin className="mt-0.5 size-3.5 shrink-0" />{pharmacy.address}</p><p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600"><Clock className="size-3.5" />{hours(pharmacy)}</p><Link className="mt-3 inline-block font-semibold text-emerald-700 hover:underline" to={`/pharmacies/${pharmacy.id}`}>Открыть аптеку</Link></div></Popup></Marker>)}</MapContainer>;
}
