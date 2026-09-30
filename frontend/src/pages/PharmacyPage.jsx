import { useEffect, useState } from "react";
import { Clock, MapPin, Phone, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api, { apiErrorMessage, mediaUrl } from "../api/axios";
import PharmacyMap from "../components/PharmacyMap";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import PageState from "../components/ui/PageState";
import useAuth from "../context/useAuth";

export default function PharmacyPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [form, setForm] = useState({ rating: "5", text: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([api.get(`pharmacies/${id}/`), api.get(`pharmacies/${id}/reviews/`)]).then(([pharmacyResponse, reviewResponse]) => { if (active) { setPharmacy(pharmacyResponse.data); setReviews(reviewResponse.data); setStatus("ready"); } }).catch(() => active && setStatus("error"));
    return () => { active = false; };
  }, [id]);

  async function submitReview(event) {
    event.preventDefault(); setSubmitting(true); setFormError("");
    try { const { data } = await api.post("reviews/", { pharmacy: Number(id), rating: Number(form.rating), text: form.text }); setReviews((items) => [data, ...items]); setForm({ rating: "5", text: "" }); }
    catch (error) { setFormError(apiErrorMessage(error, "Не удалось добавить отзыв.")); }
    finally { setSubmitting(false); }
  }

  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить аптеку" />;
  const workHours = pharmacy.is_24_hours ? "Круглосуточно" : `${pharmacy.opening_time?.slice(0, 5) || "—"}–${pharmacy.closing_time?.slice(0, 5) || "—"}`;
  return <div className="page-shell py-8 sm:py-12"><div className="grid gap-8 lg:grid-cols-[1fr_.9fr]"><div>{pharmacy.image && <img src={mediaUrl(pharmacy.image)} alt={pharmacy.name} className="mb-6 aspect-[16/7] w-full rounded-2xl object-cover" />}<span className="text-sm font-semibold text-emerald-700">Аптека</span><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{pharmacy.name}</h1><div className="mt-6 grid gap-3 text-slate-600"><Info icon={MapPin}>{pharmacy.address}</Info>{pharmacy.phone && <Info icon={Phone}><a href={`tel:${pharmacy.phone}`} className="hover:text-emerald-700">{pharmacy.phone}</a></Info>}<Info icon={Clock}>{workHours}</Info></div>{pharmacy.description && <p className="mt-6 leading-7 text-slate-600">{pharmacy.description}</p>}</div><PharmacyMap pharmacies={[pharmacy]} single className="h-[360px]" /></div><section className="mt-14"><div className="mb-6 flex items-end justify-between"><div><span className="text-sm font-semibold text-emerald-700">Мнения покупателей</span><h2 className="mt-1 text-2xl font-bold">Отзывы</h2></div><span className="text-sm text-slate-500">{reviews.length} отзывов</span></div><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><div className="space-y-3">{reviews.length ? reviews.map((review) => <Card key={review.id}><CardContent><div className="flex items-center justify-between"><div className="flex gap-0.5 text-amber-400">{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-4 ${index < review.rating ? "fill-current" : "text-slate-200"}`} />)}</div><time className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString("ru-RU")}</time></div><p className="mt-3 text-sm leading-6 text-slate-600">{review.text || "Без комментария"}</p></CardContent></Card>) : <Card><PageState type="empty" message="Отзывов пока нет" compact /></Card>}</div><Card><CardContent><h3 className="font-semibold">Оставить отзыв</h3>{user ? <form onSubmit={submitReview} className="mt-4 space-y-4"><label className="block text-sm font-medium text-slate-700">Оценка<select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3"><option value="5">5 — Отлично</option><option value="4">4 — Хорошо</option><option value="3">3 — Нормально</option><option value="2">2 — Плохо</option><option value="1">1 — Очень плохо</option></select></label><label className="block text-sm font-medium text-slate-700">Комментарий<textarea rows="4" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="focus-ring mt-1.5 w-full resize-none rounded-xl border border-slate-200 p-3" /></label>{formError && <p className="text-sm text-red-600">{formError}</p>}<Button type="submit" disabled={submitting}>{submitting ? "Отправляем..." : "Отправить"}</Button></form> : <div className="mt-4"><p className="mb-4 text-sm text-slate-500">Авторизуйтесь, чтобы поделиться мнением.</p><Link to="/login" className="focus-ring inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Войдите, чтобы оставить отзыв</Link></div>}</CardContent></Card></div></section></div>;
}

function Info({ icon: Icon, children }) { return <p className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icon className="size-4" /></span>{children}</p>; }
