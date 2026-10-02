import { BarChart3, CircleDollarSign, Star, TicketCheck } from "lucide-react";
import { formatPrice } from "../../lib/currency";
import StarRating from "../StarRating";
import Badge from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import { AdminHeading } from "./AdminDashboard";

export default function AdminAnalytics({ data }) {
  const completed = data.reservations.filter((item) => item.status === "completed");
  const turnover = completed.reduce((sum, item) => {
    const inventory = data.inventory.find((entry) => entry.id === item.pharmacy_medicine);
    return sum + Number(inventory?.price || 0) * Number(item.quantity || 0);
  }, 0);
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - offset));
    const key = date.toISOString().slice(0, 10);
    return { key, label: date.toLocaleDateString("ru-RU", { weekday: "short" }), value: data.reservations.filter((item) => item.created_at?.slice(0, 10) === key).length };
  });
  const max = Math.max(1, ...days.map((item) => item.value));
  const topPharmacies = [...data.pharmacies].filter((item) => item.review_count).sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.review_count - a.review_count).slice(0, 5);
  const topPharmacists = [...data.pharmacists].filter((item) => item.review_count).sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.review_count - a.review_count).slice(0, 5);
  const lowStock = data.inventory.filter((item) => Number(item.quantity) <= 5).slice(0, 8);
  return <div>
    <AdminHeading eyebrow="Аналитика" title="Данные и динамика" description="Графики и рейтинги построены только на текущих API-данных PharmaMap." />
    <div className="grid gap-3 sm:grid-cols-3"><Metric icon={TicketCheck} label="Завершённые брони" value={completed.length} /><Metric icon={CircleDollarSign} label="Оборот по завершённым броням" value={formatPrice(turnover)} /><Metric icon={BarChart3} label="Всего броней" value={data.reservations.length} /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><h2 className="font-extrabold">Брони за 7 дней</h2><p className="text-xs text-slate-500">Количество созданных броней по дням</p></div><Badge variant="teal">{data.reservations.length} всего</Badge></div><div className="mt-8 flex h-52 items-end gap-3">{days.map((day) => <div key={day.key} className="flex flex-1 flex-col items-center gap-2"><span className="text-xs font-bold text-slate-600">{day.value}</span><div className="w-full rounded-t-xl bg-gradient-to-t from-teal-700 to-cyan-400" style={{ height: `${Math.max(8, day.value / max * 164)}px` }} /><span className="text-[11px] text-slate-400">{day.label}</span></div>)}</div></CardContent></Card>
      <Card><CardContent className="p-6"><h2 className="font-extrabold">Низкий остаток</h2><div className="mt-4 space-y-3">{lowStock.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="text-sm font-semibold">{data.medicines.find((medicine) => medicine.id === item.medicine)?.name || `Лекарство #${item.medicine}`}</span><Badge variant={item.quantity ? "warning" : "danger"}>{item.quantity} шт.</Badge></div>)}{!lowStock.length && <p className="text-sm text-slate-500">Критичных остатков нет.</p>}</div></CardContent></Card>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2"><RankCard title="Аптеки по рейтингу" items={topPharmacies} /><RankCard title="Фармацевты по рейтингу" items={topPharmacists} /></div>
  </div>;
}

function Metric({ icon: Icon, label, value }) { return <Card><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon className="size-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><strong className="mt-1 block text-2xl font-extrabold">{value}</strong></div></CardContent></Card>; }
function RankCard({ title, items }) { return <Card><CardContent className="p-6"><h2 className="flex items-center gap-2 font-extrabold"><Star className="size-4 text-amber-500" />{title}</h2><div className="mt-4 space-y-4">{items.map((item, index) => <div key={item.id} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-xl bg-teal-50 text-xs font-extrabold text-teal-800">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name || item.username}</p><StarRating value={item.rating || 0} reviewCount={item.review_count || 0} size="sm" showValue /></div></div>)}{!items.length && <p className="text-sm text-slate-500">Пока недостаточно оценок.</p>}</div></CardContent></Card>; }
