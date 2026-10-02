import { divIcon, latLngBounds } from "leaflet";
import { Layers3, LocateFixed, MapPinned, Maximize2, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../lib/currency";
import { pharmacyHours } from "../lib/pharmacy";
import { cn } from "../lib/utils";
import Badge from "./ui/Badge";
import PageState from "./ui/PageState";

function markerIcon(selected, allDay) { return divIcon({ className: "", iconSize: selected ? [52, 58] : [40, 46], iconAnchor: selected ? [26, 54] : [20, 43], popupAnchor: [0, -45], html: `<div class="pharmacy-pin ${selected ? "is-selected" : ""} ${allDay ? "is-all-day" : ""}"><span>+</span>${allDay ? '<i aria-hidden="true"></i>' : ""}</div>` }); }
const userLocationIcon = divIcon({ className: "", iconSize: [42, 42], iconAnchor: [21, 21], html: '<div class="user-location-pin"><span></span></div>' });

function MapSync({ selected, pharmacies, route, layer, onLayer, satelliteAvailable, onLocation, onLocationError }) {
  const map = useMap();
  useEffect(() => { if (route?.positions?.length) map.fitBounds(latLngBounds(route.positions), { padding: [54, 54] }); else if (selected) map.flyTo([Number(selected.latitude), Number(selected.longitude)], Math.max(map.getZoom(), 15), { duration: .65 }); }, [map, selected, route]);
  return <MapControls map={map} pharmacies={pharmacies} layer={layer} onLayer={onLayer} satelliteAvailable={satelliteAvailable} onLocation={onLocation} onLocationError={onLocationError} />;
}

function MapControls({ map, pharmacies, layer, onLayer, satelliteAvailable, onLocation, onLocationError }) {
  const { t } = useTranslation();
  function locate() { if (!navigator.geolocation) return onLocationError(t("errors.location", { defaultValue: "Геолокация недоступна" })); navigator.geolocation.getCurrentPosition(({ coords }) => { const point = [coords.latitude, coords.longitude]; onLocation(point); map.flyTo(point, 15, { duration: .7 }); }, () => onLocationError(t("errors.locationDenied", { defaultValue: "Разрешите доступ к геолокации" })), { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }); }
  function fitAll() { if (pharmacies.length) map.fitBounds(latLngBounds(pharmacies.map((item) => [Number(item.latitude), Number(item.longitude)])), { padding: [48, 48] }); }
  const control = "grid size-10 place-items-center border-b border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-teal-700 last:border-b-0";
  return <>
    <div className="map-layer-toggle absolute right-3 top-3 z-[500] flex overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_8px_28px_rgba(15,23,42,.18)]"><button className={`rounded-lg px-3 py-2 text-xs font-bold transition ${layer === "map" ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"}`} onClick={() => onLayer("map")}>{t("map.map")}</button><button disabled={!satelliteAvailable} className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${layer === "satellite" ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"}`} title={satelliteAvailable ? t("map.satellite") : "VITE_MAPTILER_KEY"} onClick={() => onLayer("satellite")}>{t("map.satellite")}</button></div>
    <div className="map-controls absolute right-3 top-1/2 z-[500] -translate-y-1/2 overflow-hidden rounded-xl border border-slate-200 shadow-[0_8px_28px_rgba(15,23,42,.18)]"><button className={control} onClick={() => map.zoomIn()} aria-label="Zoom in"><Plus className="size-5" /></button><button className={control} onClick={() => map.zoomOut()} aria-label="Zoom out"><Minus className="size-5" /></button><button className={control} onClick={locate} aria-label={t("map.here")}><LocateFixed className="size-5" /></button><button className={control} onClick={fitAll} aria-label={t("map.fit")}><Maximize2 className="size-5" /></button><button className={`${control} disabled:cursor-not-allowed disabled:opacity-40`} disabled={!satelliteAvailable} onClick={() => onLayer(layer === "map" ? "satellite" : "map")} aria-label={t("map.satellite")}><Layers3 className="size-5" /></button></div>
  </>;
}

export default function PharmacyMap({ pharmacies, selectedPharmacyId, onSelect, className = "h-[560px]", single = false, offers = {}, variant = "card", route }) {
  const { t } = useTranslation();
  const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;
  const [layer, setLayer] = useState(() => localStorage.getItem("pharmamap_map_layer") === "satellite" && mapTilerKey ? "satellite" : "map");
  const [layerMessage, setLayerMessage] = useState("");
  const [userPosition, setUserPosition] = useState(null);
  const valid = useMemo(() => pharmacies.filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))), [pharmacies]);
  const selected = valid.find((item) => item.id === selectedPharmacyId);
  function selectLayer(next) { if (next === "satellite" && !mapTilerKey) return; setLayerMessage(""); setLayer(next); localStorage.setItem("pharmamap_map_layer", next); }
  if (!valid.length) return <div className={cn("grid bg-slate-100", variant === "card" && "rounded-[1.5rem] border border-slate-200", className)}><PageState type="empty" message={t("map.nearby")} compact /></div>;
  const center = [Number((selected || valid[0]).latitude), Number((selected || valid[0]).longitude)];
  const satellite = layer === "satellite" && mapTilerKey;
  function handleSatelliteError() { if (layer !== "satellite") return; setLayer("map"); localStorage.setItem("pharmamap_map_layer", "map"); setLayerMessage(t("errors.satellite", { defaultValue: "Спутниковый слой недоступен" })); }
  return <div className={cn("relative overflow-hidden bg-slate-100", variant === "card" && "rounded-[1.5rem] border border-slate-200 shadow-[0_20px_60px_rgba(15,118,110,.10)]", className)}><MapContainer center={center} zoom={single ? 15 : 13} scrollWheelZoom zoomControl={false} className="z-0 size-full">{satellite ? <TileLayer key="satellite" attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url={`https://api.maptiler.com/maps/satellite-v4/{z}/{x}/{y}.jpg?key=${mapTilerKey}`} eventHandlers={{ tileerror: handleSatelliteError }} /> : <TileLayer key="map" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />}<MapSync selected={selected} pharmacies={valid} route={route} layer={layer} onLayer={selectLayer} satelliteAvailable={Boolean(mapTilerKey)} onLocation={setUserPosition} onLocationError={setLayerMessage} />{userPosition && <Marker position={userPosition} icon={userLocationIcon} zIndexOffset={2000}><Popup><strong>{t("map.here")}</strong></Popup></Marker>}{route?.positions?.length > 1 && <><Polyline positions={route.positions} pathOptions={{ color: "#0f766e", weight: 6, opacity: .9 }} /><CircleMarker center={route.positions[0]} radius={7} pathOptions={{ color: "white", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }} /></>}{valid.map((pharmacy) => { const offer = offers[pharmacy.id]; return <Marker key={pharmacy.id} position={[Number(pharmacy.latitude), Number(pharmacy.longitude)]} icon={markerIcon(pharmacy.id === selectedPharmacyId, pharmacy.is_24_hours)} zIndexOffset={pharmacy.id === selectedPharmacyId ? 1000 : 0} eventHandlers={{ click: () => onSelect?.(pharmacy.id) }}><Popup><div className="min-w-52"><div className="flex items-center justify-between gap-2"><strong>{pharmacy.name}</strong>{pharmacy.is_24_hours && <Badge variant="teal">24/7</Badge>}</div><p className="mt-2 flex gap-1.5 text-sm text-slate-600"><MapPinned className="mt-0.5 size-3.5 shrink-0 text-teal-600" />{pharmacy.address}</p><p className="mt-2 text-xs font-semibold text-emerald-700">{pharmacyHours(pharmacy, t)}</p>{offer && <p className="mt-2 font-extrabold text-teal-800">{formatPrice(offer.price)} · {offer.quantity} {t("common.quantity")}</p>}<Link className="mt-3 inline-flex font-bold text-teal-700" to={`/pharmacies/${pharmacy.id}`}>{t("common.details")} →</Link></div></Popup></Marker>; })}</MapContainer>{layerMessage && <p role="status" className="absolute bottom-3 left-3 z-[500] max-w-sm rounded-xl bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white shadow-lg">{layerMessage}</p>}</div>;
}
