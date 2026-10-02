import StarRating from "./StarRating";
import { useTranslation } from "react-i18next";
import Avatar from "./ui/Avatar";
import { Card, CardContent } from "./ui/Card";

export default function ReviewCard({ review }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "tj" ? "tg-TJ" : i18n.language === "en" ? "en-US" : "ru-RU";
  return <Card><CardContent className="p-5"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><Avatar fallback={`U${review.user}`} className="size-9 text-xs" /><div><p className="text-sm font-bold text-slate-800">{t("common.user", { id: review.user })}</p><StarRating value={review.rating} size="sm" showValue={false} /></div></div><time className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString(locale)}</time></div><p className="mt-4 text-sm leading-6 text-slate-600">{review.text || t("common.noText")}</p></CardContent></Card>;
}
