import { divIcon } from "leaflet";
import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

const pickerIcon = divIcon({
  className: "",
  iconSize: [38, 46],
  iconAnchor: [19, 42],
  html: '<div class="location-picker-pin"><span>+</span></div>',
});

function ClickPicker({ onChange }) {
  useMapEvents({ click: (event) => onChange(event.latlng) });
  return null;
}

export default function LocationPickerMap({ latitude, longitude, onChange }) {
  const position = useMemo(() => [Number(latitude), Number(longitude)], [latitude, longitude]);
  function update(point) {
    onChange({ latitude: point.lat.toFixed(6), longitude: point.lng.toFixed(6) });
  }
  return <div className="relative h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
    <MapContainer center={position} zoom={14} scrollWheelZoom className="size-full" zoomControl>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickPicker onChange={update} />
      <Marker position={position} icon={pickerIcon} draggable eventHandlers={{ dragend: (event) => update(event.target.getLatLng()) }} />
    </MapContainer>
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] rounded-xl bg-white/95 px-4 py-3 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur dark:bg-slate-900/95 dark:text-slate-200">Нажмите на карту или перетащите маркер</div>
  </div>;
}
