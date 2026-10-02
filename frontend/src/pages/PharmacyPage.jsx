import { motion } from "framer-motion";
import { Clock3, MapPin, MessageCircle, Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { apiErrorMessage, mediaUrl } from "../api/axios";
import PharmacyMap from "../components/PharmacyMap";
import ReviewCard from "../components/ReviewCard";
import StarRating from "../components/StarRating";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import PageState from "../components/ui/PageState";
import useAuth from "../context/useAuth";
import useOpenPharmacyChat from "../hooks/useOpenPharmacyChat";

export default function PharmacyPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { openPharmacyChat, chatState } = useOpenPharmacyChat();
  const [pharmacy, setPharmacy] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [form, setForm] = useState({ rating: 5, text: "" });
  const [formState, setFormState] = useState({});

  useEffect(() => {
    let active = true;
    Promise.all([api.get(`pharmacies/${id}/`), api.get(`pharmacies/${id}/reviews/`)])
      .then(([pharmacyResponse, reviewResponse]) => {
        if (!active) return;
        setPharmacy(pharmacyResponse.data);
        setReviews(reviewResponse.data);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => { active = false; };
  }, [id]);

  const average = useMemo(
    () => reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
    [reviews],
  );

  async function submitReview(event) {
    event.preventDefault();
    setFormState({ loading: true });
    try {
      const { data } = await api.post("reviews/", {
        pharmacy: Number(id), rating: Number(form.rating), text: form.text,
      });
      setReviews((items) => [data, ...items.filter((item) => item.user !== data.user)]);
      setForm({ rating: 5, text: "" });
      setFormState({ success: "Спасибо! Отзыв опубликован." });
    } catch (error) {
      setFormState({ error: apiErrorMessage(error, "Не удалось добавить отзыв.") });
    }
  }

  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить аптеку" />;

  const hours = pharmacy.is_24_hours
    ? "Круглосуточно"
    : `${pharmacy.opening_time?.slice(0, 5) || "—"}–${pharmacy.closing_time?.slice(0, 5) || "—"}`;

  return (
    <div className="page-shell py-8 pb-24 sm:py-12">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,118,110,.07)]">
        <div className="grid lg:grid-cols-[1fr_.92fr]">
          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap gap-2">
              <Badge variant="teal">Аптека</Badge>
              {pharmacy.is_24_hours && <Badge variant="blue">24/7</Badge>}
            </div>
            <h1 className="mt-5 text-3xl font-extrabold tracking-[-.04em] text-slate-950 sm:text-5xl">{pharmacy.name}</h1>
            <div className="mt-4"><StarRating value={average} reviewCount={reviews.length} /></div>
            <div className="mt-7 grid gap-3">
              <Info icon={MapPin}>{pharmacy.address}</Info>
              {pharmacy.phone && <Info icon={Phone}><a href={`tel:${pharmacy.phone}`} className="hover:text-teal-700">{pharmacy.phone}</a></Info>}
              <Info icon={Clock3}>{hours}</Info>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button type="button" onClick={() => openPharmacyChat(id)} disabled={chatState.loading}><MessageCircle className="size-4" /> {chatState.loading ? "Открываем..." : "Написать"}</Button>
              <Button asChild variant="outline"><Link to={`/?pharmacy=${pharmacy.id}`}>Показать на большой карте</Link></Button>
            </div>
            {chatState.error && <p className="mt-3 text-sm font-semibold text-red-600">{chatState.error}</p>}
            {pharmacy.description && <p className="mt-7 max-w-2xl border-t border-slate-100 pt-6 leading-7 text-slate-600">{pharmacy.description}</p>}
          </div>
          <div className="min-h-72 bg-teal-50">
            {pharmacy.image
              ? <img src={mediaUrl(pharmacy.image)} alt={pharmacy.name} className="size-full object-cover" />
              : <div className="soft-grid grid size-full min-h-72 place-items-center"><span className="grid size-24 place-items-center rounded-[2rem] bg-white text-teal-700 shadow-xl"><MapPin className="size-11" /></span></div>}
          </div>
        </div>
      </motion.section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <PharmacyMap pharmacies={[pharmacy]} selectedPharmacyId={pharmacy.id} single className="h-[420px]" />
        <Card><CardContent className="p-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">Рейтинг покупателей</p>
          <div className="mt-5"><StarRating value={average} reviewCount={reviews.length} size="lg" /></div>
          <div className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((review) => review.rating === rating).length;
              const width = reviews.length ? (count / reviews.length) * 100 : 0;
              return <div key={rating} className="grid grid-cols-[12px_1fr_22px] items-center gap-2 text-xs text-slate-500"><span>{rating}</span><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${width}%` }} /></div><span>{count}</span></div>;
            })}
          </div>
        </CardContent></Card>
      </section>

      <section className="mt-12">
        <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Опыт покупателей</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Отзывы</h2></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            {reviews.length ? reviews.map((review) => <ReviewCard key={review.id} review={review} />) : <Card><PageState type="empty" message="Отзывов пока нет — станьте первым" compact /></Card>}
          </div>
          <Card className="h-fit lg:sticky lg:top-24"><CardContent className="p-6">
            <h3 className="text-lg font-extrabold text-slate-950">Поделитесь впечатлением</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">Оцените обслуживание и удобство аптеки.</p>
            {user ? <form onSubmit={submitReview} className="mt-5 space-y-4">
              <div><p className="mb-2 text-sm font-semibold text-slate-700">Оценка</p><StarRating value={form.rating} interactive size="lg" onChange={(rating) => setForm((current) => ({ ...current, rating }))} /></div>
              <label className="block text-sm font-semibold text-slate-700">Комментарий<textarea rows="5" value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} placeholder="Коротко расскажите о визите" className="focus-ring mt-2 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm" /></label>
              {formState.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{formState.error}</p>}
              {formState.success && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{formState.success}</p>}
              <Button type="submit" className="w-full" disabled={formState.loading}>{formState.loading ? "Отправляем..." : "Опубликовать отзыв"}</Button>
            </form> : <div className="mt-5"><Button asChild className="w-full"><Link to="/login">Войти и оставить отзыв</Link></Button></div>}
          </CardContent></Card>
        </div>
      </section>
    </div>
  );
}

function Info({ icon: Icon, children }) {
  return <p className="flex items-center gap-3 text-slate-600"><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon className="size-4" /></span>{children}</p>;
}
