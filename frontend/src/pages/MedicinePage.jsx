import { useEffect, useState } from "react";
import { Building2, CheckCircle2, PackageX, Pill, ScanBarcode } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { apiErrorMessage, mediaUrl } from "../api/axios";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
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
  const [quantities, setQuantities] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [medicineResponse, inventoryResponse] = await Promise.all([api.get(`medicines/${id}/`), api.get(`medicines/${id}/pharmacies/`)]);
        const inventory = inventoryResponse.data;
        const pharmacyIds = [...new Set(inventory.map((item) => item.pharmacy))];
        const pharmacies = await Promise.all(pharmacyIds.map((pharmacyId) => api.get(`pharmacies/${pharmacyId}/`).then((response) => response.data)));
        const pharmacyById = Object.fromEntries(pharmacies.map((item) => [item.id, item]));
        if (active) { setMedicine(medicineResponse.data); setOffers(inventory.map((item) => ({ ...item, pharmacyData: pharmacyById[item.pharmacy] }))); setStatus("ready"); }
      } catch { if (active) setStatus("error"); }
    }
    load(); return () => { active = false; };
  }, [id]);

  async function reserve(offer) {
    if (!user) { navigate("/login", { state: { from: { pathname: `/medicines/${id}` } } }); return; }
    const quantity = Math.max(1, Number(quantities[offer.id] || 1));
    setFeedback((value) => ({ ...value, [offer.id]: { loading: true } }));
    try { await api.post("reservations/", { pharmacy_medicine: offer.id, quantity }); setFeedback((value) => ({ ...value, [offer.id]: { success: "Лекарство забронировано" } })); }
    catch (error) { setFeedback((value) => ({ ...value, [offer.id]: { error: apiErrorMessage(error, "Не удалось создать бронь.") } })); }
  }

  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить лекарство" />;
  return <div className="page-shell py-8 sm:py-12"><div className="grid gap-8 lg:grid-cols-[340px_1fr]"><div className="grid min-h-72 place-items-center overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">{medicine.image ? <img src={mediaUrl(medicine.image)} alt={medicine.name} className="h-full w-full object-cover" /> : <Pill className="size-20 text-emerald-300" />}</div><div><span className="text-sm font-semibold text-emerald-700">Лекарство</span><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{medicine.name}</h1><p className="mt-2 text-lg text-slate-500">{[medicine.dosage, medicine.form].filter(Boolean).join(" · ")}</p><dl className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2"><Detail label="Действующее вещество" value={medicine.active_ingredient} /><Detail label="Производитель" value={medicine.manufacturer} /><Detail label="Штрихкод" value={medicine.barcode} icon={ScanBarcode} /></dl>{medicine.description && <p className="mt-7 max-w-3xl leading-7 text-slate-600">{medicine.description}</p>}</div></div><section className="mt-14"><span className="text-sm font-semibold text-emerald-700">Цены и наличие</span><h2 className="mt-1 text-2xl font-bold">Где купить</h2><div className="mt-6 space-y-3">{offers.length ? offers.map((offer) => <Card key={offer.id}><CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Building2 className="size-5" /></span><div><Link to={`/pharmacies/${offer.pharmacy}`} className="font-semibold hover:text-emerald-700">{offer.pharmacyData?.name || `Аптека №${offer.pharmacy}`}</Link><p className="mt-1 text-sm text-slate-500">{offer.pharmacyData?.address}</p><p className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${offer.quantity > 0 ? "text-emerald-700" : "text-red-600"}`}>{offer.quantity > 0 ? <><CheckCircle2 className="size-4" />В наличии: {offer.quantity}</> : <><PackageX className="size-4" />Нет в наличии</>}</p></div></div><div className="flex flex-wrap items-center gap-3 sm:justify-end"><strong className="mr-2 text-xl">{offer.price} ₼</strong>{offer.quantity > 0 && <><Input aria-label="Количество" type="number" min="1" max={offer.quantity} value={quantities[offer.id] || 1} onChange={(event) => setQuantities({ ...quantities, [offer.id]: event.target.value })} className="w-20" /><Button onClick={() => reserve(offer)} disabled={feedback[offer.id]?.loading}>{feedback[offer.id]?.loading ? "Бронируем..." : "Забронировать"}</Button></>}{feedback[offer.id]?.success && <span className="w-full text-right text-sm text-emerald-700">{feedback[offer.id].success}</span>}{feedback[offer.id]?.error && <span className="w-full text-right text-sm text-red-600">{feedback[offer.id].error}</span>}</div></CardContent></Card>) : <Card><PageState type="empty" message="Сейчас этого лекарства нет в аптеках" compact /></Card>}</div></section></div>;
}

function Detail({ label, value, icon: Icon }) { if (!value) return null; return <div><dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{Icon && <Icon className="size-4" />}{label}</dt><dd className="mt-1 text-slate-700">{value}</dd></div>; }
