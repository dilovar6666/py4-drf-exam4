import { motion } from "framer-motion";
import { Building2, CheckCircle2, MapPin, PackageCheck, Pill, ScanBarcode, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { apiErrorMessage, mediaUrl } from "../api/axios";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../components/ui/Dialog";
import Input from "../components/ui/Input";
import PageState from "../components/ui/PageState";
import useAuth from "../context/useAuth";

export default function MedicinePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [offers, setOffers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reservationStatus, setReservationStatus] = useState({});

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [medicineResponse, inventoryResponse] = await Promise.all([api.get(`medicines/${id}/`), api.get(`medicines/${id}/pharmacies/`)]);
        const inventory = inventoryResponse.data;
        const pharmacies = await Promise.all([...new Set(inventory.map((item) => item.pharmacy))].map((pharmacyId) => api.get(`pharmacies/${pharmacyId}/`).then(({ data }) => data)));
        const pharmacyById = Object.fromEntries(pharmacies.map((item) => [item.id, item]));
        if (active) { setMedicine(medicineResponse.data); setOffers(inventory.map((item) => ({ ...item, pharmacyData: pharmacyById[item.pharmacy] }))); setStatus("ready"); }
      } catch { if (active) setStatus("error"); }
    }
    load(); return () => { active = false; };
  }, [id]);

  function openReservation(offer) {
    if (!user) { navigate("/login", { state: { from: { pathname: `/medicines/${id}` } } }); return; }
    setQuantity(1); setReservationStatus({}); setSelectedOffer(offer);
  }

  async function reserve() {
    const safeQuantity = Math.max(1, Math.min(Number(quantity), selectedOffer.quantity));
    setReservationStatus({ loading: true });
    try { await api.post("reservations/", { pharmacy_medicine: selectedOffer.id, quantity: safeQuantity }); setReservationStatus({ success: true }); }
    catch (error) { setReservationStatus({ error: apiErrorMessage(error, "Не удалось создать бронь.") }); }
  }

  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить лекарство" />;
  return <div className="page-shell py-8 pb-24 sm:py-12"><motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,118,110,.07)] sm:p-8 lg:grid-cols-[360px_1fr]"><div className="grid min-h-72 place-items-center overflow-hidden rounded-[1.4rem] bg-[radial-gradient(circle_at_center,#dff9f5,#f7f9f8_70%)]">{medicine.image ? <img src={mediaUrl(medicine.image)} alt={medicine.name} className="size-full object-cover" /> : <span className="grid size-32 place-items-center rounded-[2rem] border border-teal-100 bg-white shadow-lg shadow-teal-900/5"><Pill className="size-16 text-teal-500" /></span>}</div><div className="self-center"><div className="flex flex-wrap items-center gap-2"><Badge variant="teal">Лекарство</Badge>{medicine.form && <Badge>{medicine.form}</Badge>}</div><h1 className="mt-4 text-3xl font-extrabold tracking-[-.04em] text-slate-950 sm:text-5xl">{medicine.name}</h1><p className="mt-2 text-xl font-semibold text-teal-700">{medicine.dosage}</p><dl className="mt-8 grid gap-4 sm:grid-cols-2"><Detail label="Действующее вещество" value={medicine.active_ingredient} /><Detail label="Производитель" value={medicine.manufacturer} /><Detail label="Форма выпуска" value={medicine.form} /><Detail label="Штрихкод" value={medicine.barcode} icon={ScanBarcode} /></dl>{medicine.description && <p className="mt-7 max-w-3xl border-t border-slate-100 pt-6 leading-7 text-slate-600">{medicine.description}</p>}</div></motion.section><section className="mt-12"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Цены и наличие</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-slate-950">Где купить</h2><p className="mt-2 text-sm text-slate-500">Предложения отсортированы backend по цене.</p></div>{offers.length > 0 && <Badge variant="blue">{offers.length} аптек в наличии</Badge>}</div><div className="mt-6 space-y-3">{offers.length ? offers.map((offer, index) => <Card key={offer.id} className="transition hover:border-teal-200 hover:shadow-lg"><CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div className="flex gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Building2 className="size-5" /></span><div><div className="flex flex-wrap items-center gap-2"><Link to={`/pharmacies/${offer.pharmacy}`} className="font-extrabold text-slate-950 hover:text-teal-700">{offer.pharmacyData?.name}</Link>{index === 0 && <Badge variant="success">Лучшая цена</Badge>}{offer.pharmacyData?.is_24_hours && <Badge variant="blue">24/7</Badge>}</div><p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-3.5 text-teal-600" />{offer.pharmacyData?.address}</p><p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" />В наличии: {offer.quantity} шт.</p></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-right"><strong className="block text-2xl font-extrabold tracking-tight text-slate-950">{offer.price} ₼</strong><span className="text-xs text-slate-400">за упаковку</span></div><Button onClick={() => openReservation(offer)}>Забронировать</Button></div></CardContent></Card>) : <Card><PageState type="empty" message="Сейчас этого лекарства нет в аптеках" /></Card>}</div></section><Dialog open={Boolean(selectedOffer)} onOpenChange={(open) => !open && setSelectedOffer(null)}><DialogContent>{reservationStatus.success ? <div className="py-6 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="size-8" /></span><DialogTitle className="mt-5">Бронь создана</DialogTitle><DialogDescription>Следите за статусом на странице «Мои брони».</DialogDescription><Button asChild className="mt-6"><Link to="/reservations">Открыть брони</Link></Button></div> : <><div className="flex items-start gap-4 pr-8"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700"><PackageCheck /></span><div><DialogTitle>Забронировать лекарство</DialogTitle><DialogDescription>{medicine.name} · {selectedOffer?.pharmacyData?.name}</DialogDescription></div></div><div className="mt-6 rounded-2xl bg-slate-50 p-4"><div className="flex justify-between text-sm"><span className="text-slate-500">Цена</span><b>{selectedOffer?.price} ₼</b></div><div className="mt-2 flex justify-between text-sm"><span className="text-slate-500">Доступно</span><b>{selectedOffer?.quantity} шт.</b></div></div><label className="mt-5 block text-sm font-semibold text-slate-700">Количество<Input type="number" min="1" max={selectedOffer?.quantity} value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-2" /></label>{reservationStatus.error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{reservationStatus.error}</p>}<div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={() => setSelectedOffer(null)}>Отмена</Button><Button onClick={reserve} disabled={reservationStatus.loading}><ShieldCheck className="size-4" />{reservationStatus.loading ? "Создаём..." : "Подтвердить бронь"}</Button></div></>}</DialogContent></Dialog></div>;
}

function Detail({ label, value, icon: Icon }) { if (!value) return null; return <div className="rounded-2xl bg-slate-50 p-4"><dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">{Icon && <Icon className="size-4" />}{label}</dt><dd className="mt-2 font-semibold text-slate-800">{value}</dd></div>; }
