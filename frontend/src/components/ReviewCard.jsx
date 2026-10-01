import { Star } from "lucide-react";
import Avatar from "./ui/Avatar";
import { Card, CardContent } from "./ui/Card";

export default function ReviewCard({ review }) {
  return <Card><CardContent className="p-5"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><Avatar fallback={`U${review.user}`} className="size-9 text-xs" /><div><p className="text-sm font-bold text-slate-800">Пользователь #{review.user}</p><div className="mt-0.5 flex gap-0.5">{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-3.5 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}</div></div></div><time className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString("ru-RU")}</time></div><p className="mt-4 text-sm leading-6 text-slate-600">{review.text || "Без комментария"}</p></CardContent></Card>;
}
