import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronUp, Clock3, MapPin, MessageCircle, Navigation, Phone, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { mediaUrl } from "../api/axios";
import PharmacyCard from "../components/PharmacyCard";
import PharmacyMap from "../components/PharmacyMap";
import SearchBar from "../components/SearchBar";
import StarRating from "../components/StarRating";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import PageState from "../components/ui/PageState";
import Skeleton from "../components/ui/Skeleton";
import usePharmacies from "../hooks/usePharmacies";
import { formatPrice } from "../lib/currency";
import { pharmacyHours } from "../lib/pharmacy";

function dushanbeMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dushanbe", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  return Number(parts.find((part) => part.type === "hour")?.value) * 60 + Number(parts.find((part) => part.type === "minute")?.value);
}

function isOpenNow(pharmacy) {
  if (pharmacy.is_24_hours) return true;
  if (!pharmacy.opening_time || !pharmacy.closing_time) return false;
  const [oh, om] = pharmacy.opening_time.split(":").map(Number);
  const [ch, cm] = pharmacy.closing_time.split(":").map(Number);
  const now = dushanbeMinutes();
  return now >= oh * 60 + om && now <= ch * 60 + cm;
}

export default function HomePage() {
  const { pharmacies, status } = usePharmacies();
  const [medicineResults, setMedicineResults] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [offers, setOffers] = useState({});
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [onlyAllDay, setOnlyAllDay] = useState(false);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sheetState, setSheetState] = useState("half");
  const [route, setRoute] = useState(null);
  const [routeState, setRouteState] = useState({});

  async function selectMedicine(medicine) {
    setSelectedMedicine(medicine); setMedicineResults([]); setSearchStatus("loading");
    try {
      const { data } = await api.get(`medicines/${medicine.id}/pharmacies/`);
      setOffers(Object.fromEntries(data.map((offer) => [offer.pharmacy, offer])));
      setSelectedPharmacyId(null); setSearchStatus("ready"); setSheetState("half"); setRoute(null);
    } catch { setSearchStatus("error"); }
  }

  async function search(query, cachedResults) {
    setSearchStatus("loading"); setSelectedMedicine(null); setOffers({}); setSelectedPharmacyId(null); setRoute(null);
    try {
      const data = cachedResults || (await api.get("medicines/search/", { params: { q: query } })).data;
      setMedicineResults(data); setSearchStatus("ready");
      if (data.length === 1) await selectMedicine(data[0]);
    } catch { setSearchStatus("error"); }
  }

  function selectPharmacy(id) {
    setSelectedPharmacyId(id); setRoute(null); setRouteState({});
    sessionStorage.setItem("chat_pharmacy_id", String(id)); setSheetState("half");
  }

  function buildRoute(pharmacy) {
    if (!navigator.geolocation) { setRouteState({ error: "Геолокация не поддерживается браузером." }); return; }
    setRouteState({ loading: true });
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const base = import.meta.env.VITE_ROUTING_URL || "https://router.project-osrm.org";
        const points = `${coords.longitude},${coords.latitude};${pharmacy.longitude},${pharmacy.latitude}`;
        const response = await fetch(`${base}/route/v1/driving/${points}?overview=full&geometries=geojson`);
        const data = await response.json();
        if (!response.ok || data.code !== "Ok" || !data.routes?.length) throw new Error("route");
        const result = data.routes[0];
        setRoute({ positions: result.geometry.coordinates.map(([lon, lat]) => [lat, lon]), distance: result.distance, duration: result.duration });
        setRouteState({ ready: true });
      } catch { setRouteState({ error: "Не удалось построить маршрут. Попробуйте позже." }); }
    }, () => setRouteState({ error: "Разрешите доступ к геолокации, чтобы построить маршрут." }), { enableHighAccuracy: true, timeout: 10000 });
  }

  const displayed = useMemo(() => pharmacies.filter((pharmacy) => (!selectedMedicine || offers[pharmacy.id]) && (!onlyAllDay || pharmacy.is_24_hours) && (!onlyOpen || isOpenNow(pharmacy))), [pharmacies, selectedMedicine, offers, onlyAllDay, onlyOpen]);
  const selectedPharmacy = pharmacies.find((pharmacy) => pharmacy.id === selectedPharmacyId);
  const sheetHeight = { collapsed: "h-[118px]", half: "h-[44vh]", expanded: "h-[76vh]" }[sheetState];
  const panelProps = selectedPharmacy ? { pharmacy: selectedPharmacy, offer: offers[selectedPharmacy.id], medicine: selectedMedicine, onBack: () => { setSelectedPharmacyId(null); setRoute(null); }, onRoute: buildRoute, route, routeState, onCloseRoute: () => { setRoute(null); setRouteState({}); } } : null;
  const filters = <div className="flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"><Filter active={!onlyOpen && !onlyAllDay} onClick={() => { setOnlyOpen(false); setOnlyAllDay(false); }}>Все</Filter><Filter active={onlyOpen} onClick={() => setOnlyOpen((value) => !value)}><Clock3 className="size-3.5" />Открыто сейчас</Filter><Filter active={onlyAllDay} onClick={() => setOnlyAllDay((value) => !value)}>24/7</Filter>{selectedMedicine && <Filter active onClick={() => { setSelectedMedicine(null); setOffers({}); }}>Сбросить лекарство</Filter>}</div>;

  return <main className="home-map-screen relative h-[calc(100dvh-72px)] min-h-[560px] overflow-hidden bg-slate-100">
    <aside className="absolute inset-y-0 left-0 z-[700] hidden w-[420px] flex-col border-r border-slate-200 bg-white shadow-[8px_0_28px_rgba(15,23,42,.08)] lg:flex">
      <div className="border-b border-slate-100 p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">Душанбе</p><h1 className="text-xl font-extrabold tracking-tight text-slate-950">Аптеки рядом</h1></div><Badge variant="teal">{displayed.length} мест</Badge></div><SearchBar onSearch={search} onSelect={selectMedicine} loading={searchStatus === "loading"} compact /><div className="mt-3">{filters}</div></div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"><AnimatePresence mode="wait">{selectedPharmacy ? <motion.div key="place" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}><PlacePanel {...panelProps} /></motion.div> : <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3"><ResultsHeader medicine={selectedMedicine} />{medicineResults.length > 1 && <MedicineChoices items={medicineResults} onSelect={selectMedicine} />}{status === "loading" ? Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-40 rounded-2xl" />) : status === "error" || searchStatus === "error" ? <PageState type="error" compact /> : displayed.length ? displayed.map((pharmacy) => <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} offer={offers[pharmacy.id]} onSelect={selectPharmacy} />) : <PageState type="empty" message="Аптеки по выбранным условиям не найдены" compact />}</motion.div>}</AnimatePresence></div>
    </aside>
    <div className="absolute inset-0 lg:left-[420px]"><PharmacyMap pharmacies={displayed.length ? displayed : pharmacies} offers={offers} selectedPharmacyId={selectedPharmacyId} onSelect={selectPharmacy} route={route} variant="app" className="size-full" />
      <div className="absolute inset-x-3 top-3 z-[600] lg:hidden"><SearchBar onSearch={search} onSelect={selectMedicine} loading={searchStatus === "loading"} compact /><div className="mt-2 rounded-2xl bg-white/95 p-2 shadow-lg backdrop-blur">{filters}</div></div>
      <section className={`absolute inset-x-2 bottom-2 z-[650] flex flex-col overflow-hidden rounded-t-[1.6rem] border border-slate-200 bg-white/98 shadow-[0_-12px_40px_rgba(15,23,42,.18)] backdrop-blur transition-[height] duration-300 lg:hidden ${sheetHeight}`}><div className="shrink-0 px-4 pb-2 pt-2"><button className="mx-auto block h-1.5 w-12 rounded-full bg-slate-300" onClick={() => setSheetState(sheetState === "collapsed" ? "half" : sheetState === "half" ? "expanded" : "collapsed")} aria-label="Изменить высоту списка" /><div className="mt-2 flex items-center justify-between"><div><b className="text-sm text-slate-950">{selectedPharmacy ? selectedPharmacy.name : `${displayed.length} аптек в Душанбе`}</b><p className="text-xs text-slate-500">{selectedMedicine ? selectedMedicine.name : "Выберите аптеку на карте"}</p></div><button onClick={() => setSheetState(sheetState === "expanded" ? "half" : "expanded")} className="rounded-full p-2 hover:bg-slate-100">{sheetState === "expanded" ? <ChevronDown /> : <ChevronUp />}</button></div></div><div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-5">{selectedPharmacy ? <PlacePanel {...panelProps} compact /> : displayed.map((pharmacy) => <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} offer={offers[pharmacy.id]} onSelect={selectPharmacy} />)}</div></section>
    </div>
  </main>;
}

function ResultsHeader({ medicine }) { return medicine ? <div className="rounded-2xl bg-teal-50 p-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700">Где купить</p><h2 className="mt-1 font-extrabold text-slate-950">{medicine.name} {medicine.dosage}</h2><p className="mt-1 text-xs text-slate-500">Аптеки с ценой и актуальным остатком</p></div> : null; }
function MedicineChoices({ items, onSelect }) { return <div className="rounded-2xl border border-slate-200 bg-white p-2"><p className="px-2 py-1 text-xs font-bold text-slate-500">Выберите лекарство</p>{items.slice(0, 8).map((medicine) => <button key={medicine.id} onClick={() => onSelect(medicine)} className="w-full rounded-xl px-3 py-2 text-left hover:bg-teal-50"><b className="block text-sm">{medicine.name}</b><span className="text-xs text-slate-500">{medicine.dosage} · {medicine.form}</span></button>)}</div>; }

function PlacePanel({ pharmacy, offer, medicine, onBack, compact = false, onRoute, route, routeState, onCloseRoute }) {
  return <div><button onClick={onBack} className="mb-3 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"><ArrowLeft className="size-4" />К списку</button>{!compact && <div className="h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-100 to-slate-100">{pharmacy.image ? <img src={mediaUrl(pharmacy.image)} alt="" className="size-full object-cover" /> : <div className="grid size-full place-items-center"><MapPin className="size-12 text-teal-600" /></div>}</div>}<div className="py-4"><div className="flex flex-wrap gap-2">{pharmacy.is_24_hours && <Badge variant="teal">24/7</Badge>}{isOpenNow(pharmacy) && <Badge variant="success">Открыто сейчас</Badge>}</div><h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">{pharmacy.name}</h2><div className="mt-2"><StarRating value={pharmacy.rating || 0} count={pharmacy.review_count || 0} size="sm" /></div><div className="mt-4 space-y-3 text-sm text-slate-600"><p className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-teal-600" />{pharmacy.address}</p><p className="flex gap-2"><Clock3 className="size-4 shrink-0 text-teal-600" />{pharmacyHours(pharmacy)}</p>{pharmacy.phone && <a href={`tel:${pharmacy.phone}`} className="flex gap-2 hover:text-teal-700"><Phone className="size-4" />{pharmacy.phone}</a>}</div>{route && <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Маршрут построен</p><p className="mt-1 font-extrabold text-slate-900">{(route.distance / 1000).toFixed(1)} км · {Math.max(1, Math.round(route.duration / 60))} мин</p><p className="mt-1 text-[11px] text-slate-500">OSRM · данные OpenStreetMap</p></div><button onClick={onCloseRoute} aria-label="Закрыть маршрут" className="rounded-lg p-1 text-slate-500 hover:bg-white"><X className="size-4" /></button></div></div>}{routeState.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{routeState.error}</p>}{offer && <div className="mt-5 rounded-2xl bg-teal-50 p-4"><p className="text-xs font-bold uppercase text-teal-700">{medicine?.name || "Лекарство"}</p><div className="mt-1 flex items-end justify-between"><b className="text-lg">{formatPrice(offer.price)}</b><span className={offer.quantity ? "text-emerald-700" : "text-red-600"}>{offer.quantity ? `${offer.quantity} шт.` : "Нет в наличии"}</span></div></div>}<div className="mt-5 grid grid-cols-2 gap-2"><Button asChild><Link to={`/pharmacies/${pharmacy.id}`}>Подробнее</Link></Button><Button asChild variant="secondary"><Link to={`/chats?pharmacy=${pharmacy.id}`}><MessageCircle className="size-4" />Написать</Link></Button></div><Button type="button" className="mt-2 w-full" variant="secondary" onClick={() => onRoute(pharmacy)} disabled={routeState.loading}><Navigation className="size-4" />{routeState.loading ? "Строим маршрут..." : "Проложить маршрут"}</Button>{offer && <Button asChild className="mt-2 w-full" variant="soft"><Link to={`/medicines/${medicine.id}`}>Наличие и бронь</Link></Button>}</div></div>;
}

function Filter({ active, onClick, children }) { return <button onClick={onClick} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${active ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"}`}>{children}</button>; }
