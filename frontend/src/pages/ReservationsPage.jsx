import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import ReservationCard from "../components/ReservationCard";
import { Card } from "../components/ui/Card";
import PageState from "../components/ui/PageState";

const tabs = [["all", "Все"], ["active", "Активные"], ["ready", "Готовы"], ["history", "История"]];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [status, setStatus] = useState("loading");
  const [tab, setTab] = useState("all");
  useEffect(() => { let active = true; async function load() { try { const [{ data: bookings }, { data: inventory }, { data: medicines }, { data: pharmacies }] = await Promise.all([api.get("reservations/"), api.get("pharmacy-medicines/"), api.get("medicines/"), api.get("pharmacies/")]); const inventoryById = Object.fromEntries(inventory.map((item) => [item.id, item])); const medicinesById = Object.fromEntries(medicines.map((item) => [item.id, item])); const pharmaciesById = Object.fromEntries(pharmacies.map((item) => [item.id, item])); if (active) { setReservations(bookings.map((booking) => { const stock = inventoryById[booking.pharmacy_medicine]; return { ...booking, stock, medicine: medicinesById[stock?.medicine], pharmacy: pharmaciesById[stock?.pharmacy] }; })); setStatus("ready"); } } catch { if (active) setStatus("error"); } } load(); return () => { active = false; }; }, []);
  const filtered = useMemo(() => reservations.filter((booking) => tab === "all" || (tab === "active" && ["pending", "confirmed"].includes(booking.status)) || (tab === "ready" && booking.status === "ready") || (tab === "history" && ["completed", "cancelled"].includes(booking.status))), [reservations, tab]);
  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить бронирования" />;
  return <div className="page-shell py-10 pb-28 sm:py-14"><PageHeader eyebrow="Личный кабинет" title="Мои брони" description="Отслеживайте подтверждение и готовность лекарств к выдаче." /><div className="mb-6 flex gap-2 overflow-x-auto pb-1">{tabs.map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${tab === value ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{label}</button>)}</div><div className="space-y-4">{filtered.length ? filtered.map((booking) => <ReservationCard key={booking.id} booking={booking} />) : <Card><PageState type="empty" message="В этом разделе пока нет бронирований" /></Card>}</div></div>;
}
