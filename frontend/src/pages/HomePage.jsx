import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Map, PackageCheck, Pill, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import MedicineCard from "../components/MedicineCard";
import PharmacyCard from "../components/PharmacyCard";
import PharmacyMap from "../components/PharmacyMap";
import SearchBar from "../components/SearchBar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import PageState from "../components/ui/PageState";
import Skeleton from "../components/ui/Skeleton";
import usePharmacies from "../hooks/usePharmacies";

function isOpenNow(pharmacy) {
  if (pharmacy.is_24_hours) return true;
  if (!pharmacy.opening_time || !pharmacy.closing_time) return false;
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = pharmacy.opening_time.split(":").map(Number);
  const [closeHour, closeMinute] = pharmacy.closing_time.split(":").map(Number);
  return minutes >= openHour * 60 + openMinute && minutes <= closeHour * 60 + closeMinute;
}

export default function HomePage() {
  const { pharmacies, status } = usePharmacies();
  const [categories, setCategories] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [medicineResults, setMedicineResults] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [offers, setOffers] = useState({});
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [onlyAllDay, setOnlyAllDay] = useState(false);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    Promise.all([api.get("categories/"), api.get("medicines/")]).then(([categoryResponse, medicineResponse]) => { setCategories(categoryResponse.data); setCatalog(medicineResponse.data); });
  }, []);

  async function selectMedicine(medicine) {
    setSelectedMedicine(medicine); setSearchStatus("loading");
    try {
      const { data } = await api.get(`medicines/${medicine.id}/pharmacies/`);
      const byPharmacy = Object.fromEntries(data.map((offer) => [offer.pharmacy, offer]));
      setOffers(byPharmacy);
      setSelectedPharmacyId(data[0]?.pharmacy || null);
      setSearchStatus("ready");
      window.setTimeout(() => document.getElementById("map-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch { setSearchStatus("error"); }
  }

  async function search(query, selected) {
    if (selected) { await selectMedicine(selected); return; }
    setSearchStatus("loading");
    try { const { data } = await api.get("medicines/search/", { params: { name: query } }); setMedicineResults(data); setSearchStatus("ready"); if (data.length === 1) await selectMedicine(data[0]); }
    catch { setSearchStatus("error"); }
  }

  function selectPharmacy(id) {
    setSelectedPharmacyId(id);
    if (window.innerWidth < 1024) window.setTimeout(() => document.getElementById(`pharmacy-card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 250);
  }

  const displayed = useMemo(() => pharmacies.filter((pharmacy) => (!selectedMedicine || offers[pharmacy.id]) && (!onlyAllDay || pharmacy.is_24_hours) && (!onlyOpen || isOpenNow(pharmacy))), [pharmacies, selectedMedicine, offers, onlyAllDay, onlyOpen]);
  const categoryMedicines = activeCategory ? catalog.filter((medicine) => medicine.category === activeCategory).slice(0, 4) : [];

  return <div className="overflow-hidden pb-16 md:pb-0"><section className="relative border-b border-teal-100 bg-[#f7faf9] py-14 sm:py-20"><div className="soft-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" /><div className="page-shell relative"><div className="grid items-center gap-10 lg:grid-cols-[1fr_.55fr]"><motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}><Badge variant="teal" className="mb-5"><Sparkles className="size-3.5" />Умный поиск по аптекам Баку</Badge><h1 className="max-w-4xl text-4xl font-extrabold leading-[1.04] tracking-[-.045em] text-slate-950 sm:text-6xl">Найдите нужное лекарство <span className="text-teal-700">рядом</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Сравнивайте цены, наличие и выбирайте удобную аптеку.</p><div className="mt-8 hidden max-w-3xl sm:block"><SearchBar onSearch={search} onSelect={selectMedicine} loading={searchStatus === "loading"} /></div><div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500"><span className="font-semibold text-slate-700">Популярное:</span>{catalog.slice(0, 4).map((medicine) => <button key={medicine.id} onClick={() => selectMedicine(medicine)} className="hover:text-teal-700">{medicine.name}</button>)}</div></motion.div><div className="grid grid-cols-2 gap-3"><Metric icon={Pill} value={`${catalog.length || "40+"}`} label="препаратов" /><Metric icon={Map} value={`${pharmacies.length || "10+"}`} label="аптек на карте" /><Metric icon={PackageCheck} value="Онлайн" label="остатки и цены" /><Metric icon={ShieldCheck} value="JWT" label="безопасная бронь" /></div></div><div className="mt-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">{categories.map((category) => <button key={category.id} onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)} className={`focus-ring shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCategory === category.id ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-800"}`}>{category.name}</button>)}</div></div></section><AnimatePresence>{(medicineResults.length > 1 || categoryMedicines.length > 0) && <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-b border-slate-200 bg-white"><div className="page-shell py-10"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-extrabold tracking-tight">{activeCategory ? "Препараты категории" : "Результаты поиска"}</h2><button onClick={() => { setMedicineResults([]); setActiveCategory(null); }} className="text-sm font-semibold text-slate-500 hover:text-teal-700">Скрыть</button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{(activeCategory ? categoryMedicines : medicineResults.slice(0, 8)).map((medicine) => <MedicineCard key={medicine.id} medicine={medicine} onAvailability={() => selectMedicine(medicine)} />)}</div></div></motion.section>}</AnimatePresence><section id="map-results" className="scroll-mt-24 bg-white py-8 sm:py-12"><div className="page-shell"><div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Аптеки на карте</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-.03em] text-slate-950 sm:text-3xl">{selectedMedicine ? `Где купить «${selectedMedicine.name}»` : "Выберите удобную аптеку"}</h2><p className="mt-2 text-sm text-slate-500">Список и маркеры связаны — выберите аптеку в любой части интерфейса.</p></div><div className="flex gap-2 overflow-x-auto pb-1"><FilterChip active={onlyOpen} onClick={() => setOnlyOpen((value) => !value)} icon={Clock3}>Открыто сейчас</FilterChip><FilterChip active={onlyAllDay} onClick={() => setOnlyAllDay((value) => !value)}>24/7</FilterChip>{selectedMedicine && <Button size="sm" variant="ghost" onClick={() => { setSelectedMedicine(null); setOffers({}); }}>Сбросить лекарство</Button>}</div></div><div className="relative lg:grid lg:grid-cols-[minmax(320px,38%)_1fr] lg:gap-5"><div className="order-2 hidden max-h-[680px] space-y-3 overflow-y-auto pr-2 lg:block">{status === "loading" ? Array.from({ length: 5 }, (_, index) => <PharmacySkeleton key={index} />) : status === "error" ? <PageState type="error" /> : displayed.length ? displayed.map((pharmacy) => <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} offer={offers[pharmacy.id]} selected={pharmacy.id === selectedPharmacyId} onSelect={selectPharmacy} />) : <PageState type="empty" message="Аптеки по выбранным условиям не найдены" />}</div><div className="relative lg:sticky lg:top-24 lg:h-[680px]"><div className="absolute inset-x-3 top-3 z-[600] sm:hidden"><SearchBar onSearch={search} onSelect={selectMedicine} loading={searchStatus === "loading"} compact /></div>{status === "ready" ? <PharmacyMap pharmacies={displayed.length ? displayed : pharmacies} offers={offers} selectedPharmacyId={selectedPharmacyId} onSelect={selectPharmacy} className="h-[72vh] min-h-[560px] lg:h-[680px]" /> : <Skeleton className="h-[680px] rounded-[1.5rem]" />}<div className="absolute inset-x-2 bottom-2 z-[600] max-h-[42%] overflow-y-auto rounded-[1.35rem] border border-slate-200 bg-white/96 p-2 shadow-2xl backdrop-blur-xl lg:hidden"><div className="mx-auto mb-2 h-1 w-12 rounded-full bg-slate-300" />{displayed.length ? displayed.slice(0, 5).map((pharmacy) => <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} offer={offers[pharmacy.id]} selected={pharmacy.id === selectedPharmacyId} onSelect={selectPharmacy} />) : <PageState type="empty" compact />}</div></div></div></div></section></div>;
}

function Metric({ icon: Icon, value, label }) { return <Card className="border-white/80 bg-white/80 p-4 backdrop-blur"><Icon className="size-5 text-teal-700" /><strong className="mt-5 block text-2xl font-extrabold tracking-tight">{value}</strong><span className="text-xs font-medium text-slate-500">{label}</span></Card>; }
function FilterChip({ active, onClick, icon: Icon, children }) { return <button onClick={onClick} className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-teal-200"}`}>{Icon && <Icon className="size-4" />}{children}</button>; }
function PharmacySkeleton() { return <Card className="p-5"><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-2 h-4 w-3/4" /><div className="mt-5 flex gap-2"><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 w-24" /></div></Card>; }
