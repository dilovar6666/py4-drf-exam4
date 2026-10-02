import { Award, Building2, Clock3, PackageCheck, Star, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import StarRating from "../components/StarRating";
import Badge from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import PageState from "../components/ui/PageState";

export default function LeaderboardPage() {
  const [data, setData] = useState({ pharmacies: [], pharmacists: [] });
  const [tab, setTab] = useState("pharmacies");
  const [status, setStatus] = useState("loading");
  useEffect(() => { let active = true; Promise.all([api.get("pharmacies/"), api.get("pharmacists/")]).then(([pharmacies, pharmacists]) => { if (active) { setData({ pharmacies: pharmacies.data, pharmacists: pharmacists.data }); setStatus("ready"); } }).catch(() => active && setStatus("error")); return () => { active = false; }; }, []);
  const nominations = useMemo(() => {
    const pharmacyStats = data.pharmacies;
    return [
      ["Лучший рейтинг", Star, [...pharmacyStats].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5), (item) => `${item.rating || "—"} · ${item.review_count} отзывов`],
      ["Больше всего отзывов", UsersRound, [...pharmacyStats].sort((a, b) => b.review_count - a.review_count).slice(0, 5), (item) => `${item.review_count} отзывов`],
      ["Лучшее наличие", PackageCheck, [...pharmacyStats].sort((a, b) => b.available_medicines - a.available_medicines).slice(0, 5), (item) => `${item.available_medicines} позиций`],
      ["Аптеки 24/7", Clock3, pharmacyStats.filter((item) => item.is_24_hours).slice(0, 5), () => "Круглосуточно"],
    ];
  }, [data]);
  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить рейтинги" />;
  return <div className="page-shell py-10 pb-28 sm:py-14"><PageHeader eyebrow="Рейтинги PharmaMap" title="Лучшие аптеки и фармацевты" description="Отдельные прозрачные номинации на основе отзывов, наличия и завершённых броней — без непрозрачного общего балла." /><div className="mb-7 inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"><button onClick={() => setTab("pharmacies")} className={`rounded-xl px-5 py-2.5 text-sm font-bold ${tab === "pharmacies" ? "bg-teal-700 text-white" : "text-slate-600"}`}>Аптеки</button><button onClick={() => setTab("pharmacists")} className={`rounded-xl px-5 py-2.5 text-sm font-bold ${tab === "pharmacists" ? "bg-teal-700 text-white" : "text-slate-600"}`}>Фармацевты</button></div>{tab === "pharmacies" ? <div className="grid gap-5 lg:grid-cols-2">{nominations.map(([title, Icon, items, detail]) => <Nomination key={title} title={title} icon={Icon} items={items} detail={detail} />)}</div> : <Card><CardContent className="p-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Award /></span><div><h2 className="text-xl font-extrabold">Рейтинг фармацевтов</h2><p className="text-sm text-slate-500">Оценки относятся к конкретному специалисту.</p></div></div><div className="mt-6 divide-y divide-slate-100">{[...data.pharmacists].sort((a, b) => (b.rating || 0) - (a.rating || 0)).map((item, index) => <Link key={item.id} to={`/pharmacists/${item.id}`} className="flex items-center gap-4 py-4 hover:text-teal-700"><span className="grid size-9 place-items-center rounded-xl bg-teal-50 font-extrabold text-teal-800">{index + 1}</span><div className="min-w-0 flex-1"><b>{item.username}</b><p className="text-xs text-slate-400">{item.pharmacy_name || "Аптека не назначена"}</p></div><StarRating value={item.rating || 0} count={item.review_count} size="sm" /></Link>)}</div></CardContent></Card>}</div>;
}

function Nomination({ title, icon: Icon, items, detail }) { return <Card><CardContent className="p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon className="size-5" /></span><h2 className="font-extrabold">{title}</h2></div><div className="mt-5 space-y-3">{items.length ? items.map((item, index) => <Link key={item.id} to={`/pharmacies/${item.id}`} className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-slate-50"><span className="grid size-8 place-items-center rounded-xl bg-slate-100 text-xs font-extrabold">{index + 1}</span><Building2 className="size-4 text-teal-700" /><span className="min-w-0 flex-1 truncate font-bold">{item.name}</span><Badge variant="teal">{detail(item)}</Badge></Link>) : <p className="text-sm text-slate-500">Пока недостаточно данных.</p>}</div></CardContent></Card>; }
