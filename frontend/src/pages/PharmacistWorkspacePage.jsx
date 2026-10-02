import { Bell, Boxes, Building2, MessageCircle, PackageSearch, Star, TicketCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import PageState from "../components/ui/PageState";
import useAuth from "../context/useAuth";
import useNotifications from "../context/useNotifications";

export default function PharmacistWorkspacePage() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (user?.role !== "pharmacist" || user.is_staff) return;
    Promise.all([api.get("pharmacy-workers/"), api.get("pharmacies/"), api.get("pharmacy-medicines/"), api.get("reservations/"), api.get("chats/"), api.get("reviews/")])
      .then(([workers, pharmacies, inventory, reservations, chats, reviews]) => {
        const worker = workers.data[0];
        const pharmacy = pharmacies.data.find((item) => item.id === worker?.pharmacy);
        setData({ worker, pharmacy, inventory: inventory.data.filter((item) => item.pharmacy === worker?.pharmacy), reservations: reservations.data, chats: chats.data, reviews: reviews.data.filter((item) => item.pharmacy === worker?.pharmacy) });
      }).catch(() => setError("Не удалось загрузить рабочее место фармацевта."));
  }, [user]);
  const metrics = useMemo(() => data ? [
    ["Ожидают", data.reservations.filter((item) => item.status === "pending").length, TicketCheck, "amber"],
    ["Низкий остаток", data.inventory.filter((item) => Number(item.quantity) <= 5).length, PackageSearch, "rose"],
    ["Активные чаты", data.chats.length, MessageCircle, "teal"],
    ["Отзывы аптеки", data.reviews.length, Star, "blue"],
  ] : [], [data]);
  if (!user || user.role !== "pharmacist" || user.is_staff) return <Navigate to="/" replace />;
  if (error) return <PageState type="error" message={error} />;
  if (!data) return <PageState type="loading" />;
  if (!data.pharmacy) return <PageState type="empty" message="Ваш аккаунт ещё не связан с аптекой" />;
  return <div className="page-shell py-10 pb-28 sm:py-14">
    <PageHeader eyebrow="Рабочее место фармацевта" title={data.pharmacy.name} description="Брони, остатки, чаты и отзывы только вашей аптеки." actions={<Button asChild variant="secondary"><Link to={`/pharmacies/${data.pharmacy.id}`}><Building2 className="size-4" />Страница аптеки</Link></Button>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon, color]) => <Card key={label}><CardContent className="flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-2xl ${color === "amber" ? "bg-amber-50 text-amber-700" : color === "rose" ? "bg-rose-50 text-rose-700" : color === "blue" ? "bg-blue-50 text-blue-700" : "bg-teal-50 text-teal-700"}`}><Icon className="size-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><strong className="text-3xl font-extrabold">{value}</strong></div></CardContent></Card>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <Card><CardContent className="p-0"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-extrabold">Очередь броней</h2><p className="text-xs text-slate-500">Допустимые статусы меняются на странице броней</p></div><Button asChild size="sm"><Link to="/reservations">Открыть очередь</Link></Button></div><div className="divide-y divide-slate-100">{data.reservations.slice(0, 7).map((item) => <div key={item.id} className="flex items-center justify-between gap-4 p-4"><div><b className="text-sm">Бронь #{item.id}</b><p className="text-xs text-slate-500">{item.quantity} уп. · пользователь #{item.user}</p></div><StatusBadge status={item.status} /></div>)}{!data.reservations.length && <PageState type="empty" message="Броней пока нет" compact />}</div></CardContent></Card>
      <div className="space-y-6"><Card><CardContent className="p-6"><h2 className="flex items-center gap-2 font-extrabold"><Boxes className="size-5 text-teal-700" />Остатки</h2><div className="mt-4 space-y-3">{data.inventory.filter((item) => Number(item.quantity) <= 5).slice(0, 6).map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="text-sm font-semibold">Лекарство #{item.medicine}</span><Badge variant={item.quantity ? "warning" : "danger"}>{item.quantity} шт.</Badge></div>)}{!data.inventory.some((item) => Number(item.quantity) <= 5) && <p className="text-sm text-slate-500">Критичных остатков нет.</p>}</div></CardContent></Card><Card><CardContent className="p-6"><h2 className="font-extrabold">Быстрые действия</h2><div className="mt-4 grid gap-2"><Button asChild variant="secondary"><Link to="/chats"><MessageCircle className="size-4" />Ответить в чатах</Link></Button><Button asChild variant="secondary"><Link to="/notifications"><Bell className="size-4" />Уведомления {unreadCount ? `· ${unreadCount}` : ""}</Link></Button></div></CardContent></Card></div>
    </div>
  </div>;
}
