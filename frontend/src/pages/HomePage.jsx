import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Search, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import MedicineCard from "../components/MedicineCard";
import PharmacyCard from "../components/PharmacyCard";
import PharmacyMap from "../components/PharmacyMap";
import SearchBar from "../components/SearchBar";
import { Card, CardContent } from "../components/ui/Card";
import PageState from "../components/ui/PageState";

export default function HomePage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [pharmacyStatus, setPharmacyStatus] = useState("loading");
  const [medicines, setMedicines] = useState([]);
  const [searchStatus, setSearchStatus] = useState("idle");

  useEffect(() => { let active = true; api.get("pharmacies/").then(({ data }) => { if (active) { setPharmacies(data); setPharmacyStatus("ready"); } }).catch(() => active && setPharmacyStatus("error")); return () => { active = false; }; }, []);
  async function searchMedicines(query) { setSearchStatus("loading"); try { const { data } = await api.get("medicines/search/", { params: { name: query } }); setMedicines(data); setSearchStatus("ready"); } catch { setSearchStatus("error"); } }
  return (
    <>
      <section className="overflow-hidden border-b border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20 sm:py-28">
        <div className="page-shell grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div><span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"><MapPin className="size-3.5" />Аптеки вашего города</span><h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">Найдите лекарство <span className="text-emerald-700">рядом</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Проверьте наличие и цены в ближайших аптеках, а затем забронируйте нужное лекарство.</p><a href="#search" className="focus-ring mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800">Начать поиск <ArrowRight className="size-4" /></a></div>
          <Card className="border-emerald-100 bg-white/80 shadow-xl shadow-emerald-900/5"><CardContent className="p-7"><div className="grid gap-5"><Feature icon={Search} title="Удобный поиск" text="Ищите по названию лекарства." /><Feature icon={MapPin} title="Аптеки на карте" text="Смотрите адреса и режим работы." /><Feature icon={ShieldCheck} title="Быстрое бронирование" text="Резервируйте доступный товар онлайн." /></div></CardContent></Card>
        </div>
      </section>
      <section id="search" className="page-shell py-14"><div className="mx-auto max-w-3xl text-center"><span className="text-sm font-semibold text-emerald-700">Поиск по каталогу</span><h2 className="mt-2 text-3xl font-bold tracking-tight">Какое лекарство вам нужно?</h2><div className="mt-7"><SearchBar onSearch={searchMedicines} loading={searchStatus === "loading"} /></div></div>{searchStatus !== "idle" && <div className="mt-10">{searchStatus === "loading" && <PageState type="loading" compact />}{searchStatus === "error" && <PageState type="error" compact />}{searchStatus === "ready" && (medicines.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{medicines.map((medicine) => <MedicineCard key={medicine.id} medicine={medicine} />)}</div> : <PageState type="empty" compact />)}</div>}</section>
      <section className="border-y border-slate-200 bg-white py-14"><div className="page-shell"><div className="mb-7"><span className="text-sm font-semibold text-emerald-700">Рядом с вами</span><h2 className="mt-1 text-3xl font-bold tracking-tight">Аптеки на карте</h2></div>{pharmacyStatus === "loading" && <PageState type="loading" />}{pharmacyStatus === "error" && <PageState type="error" message="Не удалось загрузить аптеки" />}{pharmacyStatus === "ready" && <PharmacyMap pharmacies={pharmacies} />}</div></section>
      <section className="page-shell py-14"><div className="mb-7 flex items-end justify-between"><div><span className="text-sm font-semibold text-emerald-700">Каталог аптек</span><h2 className="mt-1 text-3xl font-bold tracking-tight">Выберите аптеку</h2></div><span className="hidden text-sm text-slate-500 sm:block">{pharmacies.length} аптек</span></div>{pharmacyStatus === "ready" && (pharmacies.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{pharmacies.slice(0, 6).map((pharmacy) => <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />)}</div> : <PageState type="empty" message="Аптеки пока не добавлены" />)}</section>
    </>
  );
}

function Feature({ icon: Icon, title, text }) { return <div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><Icon className="size-5" /></span><div><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div></div>; }
