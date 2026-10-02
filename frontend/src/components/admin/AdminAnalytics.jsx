import { BarChart3, CircleDollarSign, PackageX, Star, TicketCheck } from "lucide-react";
import { formatPrice } from "../../lib/currency";
import StarRating from "../StarRating";
import Badge from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import { AdminHeading } from "./AdminDashboard";

const labels = { pending: "Ожидают", confirmed: "Подтверждены", ready: "Готовы", completed: "Завершены", cancelled: "Отменены" };
const colors = { pending: "bg-amber-400", confirmed: "bg-blue-500", ready: "bg-teal-500", completed: "bg-emerald-500", cancelled: "bg-slate-400" };

export default function AdminAnalytics({ data }) {
  const completed = data.reservations.filter((item) => item.status === "completed");
  const inventory = Object.fromEntries(data.inventory.map((item) => [item.id, item]));
  const medicines = Object.fromEntries(data.medicines.map((item) => [item.id, item]));
  const pharmacies = Object.fromEntries(data.pharmacies.map((item) => [item.id, item]));
  const turnover = completed.reduce((sum, item) => sum + Number(inventory[item.pharmacy_medicine]?.price || 0) * Number(item.quantity || 0), 0);
  const rated = data.pharmacies.filter((item) => item.rating != null);
  const avgRating = rated.length ? rated.reduce((sum, item) => sum + Number(item.rating), 0) / rated.length : 0;
  const days = Array.from({ length: 7 }, (_, offset) => { const date = new Date(); date.setDate(date.getDate() - (6 - offset)); const key = date.toISOString().slice(0, 10); return { key, label: date.toLocaleDateString("ru-RU", { weekday: "short" }), value: data.reservations.filter((item) => item.created_at?.slice(0, 10) === key).length }; });
  const maxDay = Math.max(1, ...days.map((item) => item.value));
  const statuses = Object.keys(labels).map((status) => ({ status, count: data.reservations.filter((item) => item.status === status).length }));
  const maxStatus = Math.max(1, ...statuses.map((item) => item.count));
  const popularCounts = completed.reduce((result, item) => { const medicineId = inventory[item.pharmacy_medicine]?.medicine; if (medicineId) result[medicineId] = (result[medicineId] || 0) + Number(item.quantity || 0); return result; }, {});
  const popular = Object.entries(popularCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const lowStock = data.inventory.filter((item) => Number(item.quantity) <= 5).sort((a, b) => Number(a.quantity) - Number(b.quantity)).slice(0, 8);
  const topPharmacies = [...data.pharmacies].filter((item) => item.review_count).sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.review_count - a.review_count).slice(0, 5);
  const topPharmacists = [...data.pharmacists].filter((item) => item.review_count).sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.review_count - a.review_count).slice(0, 5);
  return <div>
    <AdminHeading eyebrow="Аналитика" title="Данные и динамика" description="Компактная сводка по броням, остаткам и рейтингам на основе текущих API-данных." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><Metric icon={TicketCheck} label="Завершённые" value={completed.length} /><Metric icon={CircleDollarSign} label="Оборот броней" value={formatPrice(turnover)} /><Metric icon={BarChart3} label="Всего броней" value={data.reservations.length} /><Metric icon={Star} label="Средний рейтинг" value={avgRating.toFixed(1)} /><Metric icon={PackageX} label="Низкий остаток" value={lowStock.length} /></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <Card><CardContent className="p-5"><Title title="Брони за 7 дней" subtitle="Новые бронирования по дням" /><div className="mt-5 flex h-44 items-end gap-2">{days.map((day) => <div key={day.key} className="flex flex-1 flex-col items-center gap-1.5"><span className="text-xs font-bold text-slate-600">{day.value}</span><div className="w-full max-w-12 rounded-t-lg bg-teal-600" style={{ height: `${Math.max(6, day.value / maxDay * 116)}px` }} /><span className="text-[10px] text-slate-400">{day.label}</span></div>)}</div></CardContent></Card>
      <Card><CardContent className="p-5"><Title title="Статусы броней" subtitle="Текущее распределение очереди" /><div className="mt-5 space-y-3">{statuses.map((item) => <div key={item.status} className="grid grid-cols-[110px_1fr_28px] items-center gap-3"><span className="text-xs font-semibold text-slate-600">{labels[item.status]}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${colors[item.status]}`} style={{ width: `${item.count / maxStatus * 100}%` }} /></div><b className="text-right text-xs">{item.count}</b></div>)}</div></CardContent></Card>
      <Card><CardContent className="p-5"><Title title="Популярные лекарства" subtitle="Упаковки в завершённых бронях" /><div className="mt-3 divide-y divide-slate-100">{popular.map(([id, count], index) => <div key={id} className="flex items-center gap-3 py-3"><span className="grid size-7 place-items-center rounded-lg bg-teal-50 text-xs font-extrabold text-teal-700">{index + 1}</span><b className="min-w-0 flex-1 truncate text-sm">{medicines[id]?.name || `Лекарство #${id}`}</b><Badge variant="teal">{count} уп.</Badge></div>)}{!popular.length && <p className="py-4 text-sm text-slate-500">Завершённых броней пока нет.</p>}</div></CardContent></Card>
      <Card><CardContent className="p-5"><Title title="Низкий остаток" subtitle="Препарат, аптека и фактическое количество" /><div className="mt-3 max-h-72 divide-y divide-slate-100 overflow-y-auto">{lowStock.map((item) => <div key={item.id} className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><b className="block truncate text-sm">{medicines[item.medicine]?.name || `Лекарство #${item.medicine}`}</b><p className="truncate text-xs text-slate-500">{pharmacies[item.pharmacy]?.name || `Аптека #${item.pharmacy}`}</p></div><Badge variant={item.quantity ? "warning" : "danger"}>{item.quantity} шт.</Badge></div>)}{!lowStock.length && <p className="py-4 text-sm text-slate-500">Критичных остатков нет.</p>}</div></CardContent></Card>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-2"><RankCard title="Аптеки по рейтингу" items={topPharmacies} /><RankCard title="Фармацевты по рейтингу" items={topPharmacists} /></div>
  </div>;
}

function Title({ title, subtitle }) { return <div><h2 className="font-extrabold">{title}</h2><p className="mt-0.5 text-xs text-slate-500">{subtitle}</p></div>; }
function Metric({ icon: Icon, label, value }) { return <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon className="size-4" /></span><div className="min-w-0"><p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><strong className="mt-0.5 block truncate text-xl font-extrabold">{value}</strong></div></CardContent></Card>; }
function RankCard({ title, items }) { return <Card><CardContent className="p-5"><h2 className="flex items-center gap-2 font-extrabold"><Star className="size-4 text-amber-500" />{title}</h2><div className="mt-3 divide-y divide-slate-100">{items.map((item, index) => <div key={item.id} className="flex items-center gap-3 py-3"><span className="grid size-7 place-items-center rounded-lg bg-teal-50 text-xs font-extrabold text-teal-800">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name || item.username}</p><StarRating value={item.rating || 0} reviewCount={item.review_count || 0} size="sm" showValue /></div></div>)}{!items.length && <p className="py-4 text-sm text-slate-500">Пока недостаточно оценок.</p>}</div></CardContent></Card>; }
