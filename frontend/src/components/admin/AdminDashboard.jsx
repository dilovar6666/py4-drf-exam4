import { Building2, MessageCircle, Pill, Star, TicketCheck, UsersRound } from "lucide-react";
import { formatPrice } from "../../lib/currency";
import StarRating from "../StarRating";
import Badge from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";

const metricColorClasses = {
  teal: "bg-teal-50 text-teal-700",
  blue: "bg-blue-50 text-blue-700",
  violet: "bg-violet-50 text-violet-700",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  cyan: "bg-cyan-50 text-cyan-700",
};

export default function AdminDashboard({ data }) {
  const completed = data.reservations.filter((item) => item.status === "completed");
  const pending = data.reservations.filter((item) => item.status === "pending");
  const turnover = completed.reduce((sum, item) => {
    const stock = data.inventory.find((entry) => entry.id === item.pharmacy_medicine);
    return sum + Number(stock?.price || 0) * item.quantity;
  }, 0);
  const average = data.reviews.length ? data.reviews.reduce((sum, item) => sum + item.rating, 0) / data.reviews.length : 0;
  const metrics = [
    ["Аптеки", data.pharmacies.length, Building2, "teal"],
    ["Лекарства", data.medicines.length, Pill, "blue"],
    ["Пользователи", data.users.length, UsersRound, "violet"],
    ["Ожидают", pending.length, TicketCheck, "amber"],
    ["Завершены", completed.length, TicketCheck, "emerald"],
    ["Активные чаты", data.chats.length, MessageCircle, "cyan"],
  ];
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - offset));
    const key = date.toISOString().slice(0, 10);
    return { label: date.toLocaleDateString("ru-RU", { weekday: "short" }), value: data.reservations.filter((item) => item.created_at?.slice(0, 10) === key).length };
  });
  const max = Math.max(1, ...days.map((item) => item.value));
  const lowStock = data.inventory.filter((item) => item.quantity <= 5).slice(0, 7);
  const topPharmacies = [...data.pharmacies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  const topPharmacists = [...data.pharmacists].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  return <div><AdminHeading eyebrow="Обзор" title="Dashboard" description="Операционные показатели PharmaMap на основе текущих API-данных." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(([label, value, Icon, color]) => <Card key={label}><CardContent className="flex items-center gap-4 p-5"><span className={`grid size-12 place-items-center rounded-2xl ${metricColorClasses[color]}`}><Icon className="size-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><strong className="mt-1 block text-3xl font-extrabold tracking-tight">{value}</strong></div></CardContent></Card>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.6fr]"><Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><h2 className="font-extrabold">Брони за 7 дней</h2><p className="text-xs text-slate-500">Созданные бронирования по дням</p></div><Badge variant="teal">{data.reservations.length} всего</Badge></div><div className="mt-8 flex h-48 items-end gap-3">{days.map((day) => <div key={day.label} className="flex flex-1 flex-col items-center gap-2"><span className="text-xs font-bold text-slate-600">{day.value}</span><div className="w-full rounded-t-xl bg-gradient-to-t from-teal-700 to-teal-400" style={{ height: `${Math.max(8, day.value / max * 150)}px` }} /><span className="text-[11px] text-slate-400">{day.label}</span></div>)}</div></CardContent></Card><Card><CardContent className="p-6"><h2 className="font-extrabold">Завершённые брони</h2><strong className="mt-5 block text-4xl font-extrabold tracking-tight">{formatPrice(turnover)}</strong><p className="mt-1 text-xs text-slate-500">Оборот по завершённым броням, не бухгалтерская прибыль</p><div className="mt-6 rounded-2xl bg-amber-50 p-4"><StarRating value={average} count={data.reviews.length} /><p className="mt-2 text-xs text-amber-800">Средний рейтинг аптек по отзывам</p></div></CardContent></Card></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-3"><RankCard title="Лучшие аптеки" items={topPharmacies} /><RankCard title="Лучшие фармацевты" items={topPharmacists} /><Card><CardContent className="p-6"><h2 className="font-extrabold">Низкий остаток</h2><div className="mt-4 space-y-3">{lowStock.length ? lowStock.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="text-sm font-semibold">#{item.medicine} · аптека #{item.pharmacy}</span><Badge variant={item.quantity ? "warning" : "danger"}>{item.quantity} шт.</Badge></div>) : <p className="text-sm text-slate-500">Критичных остатков нет.</p>}</div></CardContent></Card></div>
  </div>;
}

export function AdminHeading({ eyebrow, title, description, actions }) { return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{eyebrow}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.035em] text-slate-950">{title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p></div>{actions}</div>; }
function RankCard({ title, items }) { return <Card><CardContent className="p-6"><h2 className="font-extrabold">{title}</h2><div className="mt-4 space-y-4">{items.length ? items.map((item, index) => <div key={item.id} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-xl bg-teal-50 text-xs font-extrabold text-teal-800">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name || item.username}</p><StarRating value={item.rating || 0} count={item.review_count || 0} size="sm" showValue /></div></div>) : <p className="text-sm text-slate-500">Пока нет оценок.</p>}</div></CardContent></Card>; }
