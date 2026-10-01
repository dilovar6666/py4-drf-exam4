import { Building2, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { apiErrorMessage, mediaUrl } from "../api/axios";
import ReviewCard from "../components/ReviewCard";
import StarRating from "../components/StarRating";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import PageState from "../components/ui/PageState";
import useAuth from "../context/useAuth";

export default function PharmacistPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pharmacist, setPharmacist] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("loading");
  const [formState, setFormState] = useState({});
  useEffect(() => { let active = true; Promise.all([api.get("pharmacists/"), api.get("pharmacist-reviews/", { params: { pharmacist: id } })]).then(([people, reviewResponse]) => { if (!active) return; setPharmacist(people.data.find((item) => item.id === Number(id))); setReviews(reviewResponse.data); setStatus("ready"); }).catch(() => active && setStatus("error")); return () => { active = false; }; }, [id]);
  const average = useMemo(() => reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0, [reviews]);
  async function submit(event) { event.preventDefault(); if (!rating) return; setFormState({ loading: true }); try { const { data } = await api.post("pharmacist-reviews/", { pharmacist: Number(id), rating, text }); setReviews((items) => [data, ...items]); setText(""); setRating(0); setFormState({ success: "Спасибо! Оценка опубликована." }); } catch (error) { setFormState({ error: apiErrorMessage(error, "Не удалось сохранить оценку.") }); } }
  if (status === "loading") return <PageState type="loading" />;
  if (status === "error" || !pharmacist) return <PageState type="error" message="Фармацевт не найден" />;
  return <div className="page-shell py-10 pb-28 sm:py-14"><Card className="overflow-hidden"><div className="h-28 bg-teal-800 soft-grid" /><CardContent className="relative grid gap-6 px-6 pb-8 lg:grid-cols-[1fr_auto]"><div><div className="-mt-14 grid size-28 place-items-center overflow-hidden rounded-[2rem] border-4 border-white bg-teal-50 text-teal-700 shadow-xl">{pharmacist.avatar ? <img src={mediaUrl(pharmacist.avatar)} alt={pharmacist.username} className="size-full object-cover" /> : <UserRound className="size-12" />}</div><h1 className="mt-5 text-3xl font-extrabold tracking-tight">{pharmacist.username}</h1><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Building2 className="size-4 text-teal-700" />{pharmacist.pharmacy_name || "Аптека не назначена"}</p></div><div className="self-end rounded-2xl bg-amber-50 p-5"><StarRating value={average} count={reviews.length} size="lg" /><p className="mt-2 text-xs text-amber-800">Личная оценка специалиста</p></div></CardContent></Card><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]"><div className="space-y-3">{reviews.length ? reviews.map((review) => <ReviewCard key={review.id} review={review} />) : <Card><PageState type="empty" message="Оценок пока нет" compact /></Card>}</div><Card className="h-fit lg:sticky lg:top-24"><CardContent className="p-6"><h2 className="font-extrabold">Оценить фармацевта</h2><p className="mt-1 text-sm text-slate-500">Один пользователь может оставить одну оценку специалисту.</p>{user ? <form onSubmit={submit} className="mt-5 space-y-4"><StarRating value={rating} onChange={setRating} readOnly={false} size="lg" /><textarea rows="5" value={text} onChange={(event) => setText(event.target.value)} placeholder="Комментарий" className="focus-ring w-full rounded-xl border border-slate-200 p-3 text-sm" />{formState.error && <p className="text-sm text-red-600">{formState.error}</p>}{formState.success && <p className="text-sm text-emerald-700">{formState.success}</p>}<Button type="submit" disabled={!rating || formState.loading} className="w-full">Опубликовать</Button></form> : <Button asChild className="mt-5 w-full"><Link to="/login">Войти для оценки</Link></Button>}</CardContent></Card></div></div>;
}
