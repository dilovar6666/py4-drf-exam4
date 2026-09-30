import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, PackageCheck, Pill } from "lucide-react";
import api from "../api/axios";
import { Card, CardContent } from "../components/ui/Card";
import PageState from "../components/ui/PageState";

const statusLabels = { pending: "Ожидает подтверждения", confirmed: "Подтверждена", ready: "Готова к выдаче", completed: "Завершена", cancelled: "Отменена" };
const statusStyles = { pending: "bg-amber-50 text-amber-700", confirmed: "bg-blue-50 text-blue-700", ready: "bg-emerald-50 text-emerald-700", completed: "bg-slate-100 text-slate-600", cancelled: "bg-red-50 text-red-700" };

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [{ data: bookings }, { data: inventory }, { data: medicines }, { data: pharmacies }] = await Promise.all([api.get("reservations/"), api.get("pharmacy-medicines/"), api.get("medicines/"), api.get("pharmacies/")]);
        const inventoryById = Object.fromEntries(inventory.map((item) => [item.id, item]));
        const medicinesById = Object.fromEntries(medicines.map((item) => [item.id, item]));
        const pharmaciesById = Object.fromEntries(pharmacies.map((item) => [item.id, item]));
        const enriched = bookings.map((booking) => { const stock = inventoryById[booking.pharmacy_medicine]; return { ...booking, stock, medicine: medicinesById[stock?.medicine], pharmacy: pharmaciesById[stock?.pharmacy] }; });
        if (active) { setReservations(enriched); setStatus("ready"); }
      } catch { if (active) setStatus("error"); }
    }
    load(); return () => { active = false; };
  }, []);

  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить бронирования" />;
  return <div className="page-shell py-10 sm:py-14"><span className="text-sm font-semibold text-emerald-700">Личный кабинет</span><h1 className="mt-1 text-3xl font-bold tracking-tight">Мои брони</h1><p className="mt-2 text-slate-500">Следите за статусом забронированных лекарств.</p><div className="mt-7 space-y-4">{reservations.length ? reservations.map((booking) => <Card key={booking.id}><CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Pill className="size-6" /></span><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-semibold text-slate-900">{booking.medicine?.name || "Лекарство"}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[booking.status] || statusStyles.pending}`}>{statusLabels[booking.status] || booking.status}</span></div><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin className="size-4 text-emerald-600" />{booking.pharmacy?.name || "Аптека"}{booking.pharmacy?.address ? ` · ${booking.pharmacy.address}` : ""}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span className="flex items-center gap-1.5"><PackageCheck className="size-4" />Количество: {booking.quantity}</span><span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{new Date(booking.created_at).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}</span>{booking.expires_at && <span className="flex items-center gap-1.5"><Clock3 className="size-4" />До {new Date(booking.expires_at).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}</span>}</div></div></div>{booking.stock?.price && <div className="shrink-0 text-right"><p className="text-xs text-slate-400">Стоимость</p><strong className="text-xl">{(Number(booking.stock.price) * booking.quantity).toFixed(2)} ₼</strong></div>}</CardContent></Card>) : <Card><PageState type="empty" message="У вас пока нет бронирований" /></Card>}</div></div>;
}
