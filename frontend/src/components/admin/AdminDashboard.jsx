import { Building2, ClipboardList, MessageCircle, PackageX, Pill, TicketCheck, UsersRound } from "lucide-react";
import Badge from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";

const colors = { teal: "bg-teal-50 text-teal-700", blue: "bg-blue-50 text-blue-700", violet: "bg-violet-50 text-violet-700", amber: "bg-amber-50 text-amber-700", cyan: "bg-cyan-50 text-cyan-700", rose: "bg-rose-50 text-rose-700" };

export default function AdminDashboard({ data, onNavigate }) {
  const pending = data.reservations.filter((item) => item.status === "pending");
  const lowStock = data.inventory.filter((item) => Number(item.quantity) <= 5);
  const pendingApplications = data.applications.filter((item) => item.status === "pending");
  const recentReservations = [...data.reservations].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const metrics = [
    ["Аптеки", data.pharmacies.length, Building2, "teal", "pharmacies"],
    ["Лекарства", data.medicines.length, Pill, "blue", "medicines"],
    ["Пользователи", data.users.length, UsersRound, "violet", "users"],
    ["Новые брони", pending.length, TicketCheck, "amber", "reservations"],
    ["Активные чаты", data.chats.length, MessageCircle, "cyan", "chats"],
    ["Низкий остаток", lowStock.length, PackageX, "rose", "inventory"],
    ["Заявки аптек", pendingApplications.length, ClipboardList, "teal", "applications"],
  ];
  return <div>
    <AdminHeading eyebrow="Обзор" title="Dashboard" description="Короткая операционная сводка. Детальные графики и рейтинги находятся в Analytics." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon, color, target]) => <button key={label} onClick={() => onNavigate(target)} className="text-left"><Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg"><CardContent className="flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-2xl ${colors[color]}`}><Icon className="size-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><strong className="mt-1 block text-3xl font-extrabold">{value}</strong></div></CardContent></Card></button>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <Card><CardContent className="p-0"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-extrabold">Последние брони</h2><p className="text-xs text-slate-500">Текущая очередь обработки</p></div><button onClick={() => onNavigate("reservations")} className="text-xs font-bold text-teal-700">Открыть все</button></div><div className="divide-y divide-slate-100">{recentReservations.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 p-4"><div><b className="text-sm">Бронь #{item.id}</b><p className="text-xs text-slate-500">Пользователь #{item.user} · {item.quantity} уп.</p></div><Badge variant={item.status === "pending" ? "warning" : "teal"}>{item.status}</Badge></div>)}{!recentReservations.length && <p className="p-6 text-sm text-slate-500">Броней пока нет.</p>}</div></CardContent></Card>
      <Card><CardContent className="p-6"><h2 className="font-extrabold">Требует внимания</h2><div className="mt-5 space-y-3"><Attention label="Заявки аптек" value={pendingApplications.length} onClick={() => onNavigate("applications")} /><Attention label="Ожидающие брони" value={pending.length} onClick={() => onNavigate("reservations")} /><Attention label="Низкий остаток" value={lowStock.length} onClick={() => onNavigate("inventory")} /></div></CardContent></Card>
    </div>
  </div>;
}

function Attention({ label, value, onClick }) { return <button onClick={onClick} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-teal-50"><span className="text-sm font-semibold">{label}</span><Badge variant={value ? "warning" : "teal"}>{value}</Badge></button>; }
export function AdminHeading({ eyebrow, title, description, actions }) { return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{eyebrow}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.035em] text-slate-950">{title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p></div>{actions}</div>; }
