import { Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export default function StarRating({ value = 0, onChange, readOnly = true, interactive = false, count, reviewCount, size = "md", showValue = true, className }) {
  const [hovered, setHovered] = useState(0);
  const { t } = useTranslation();
  const editable = interactive || !readOnly;
  const visibleCount = count ?? reviewCount;
  const display = hovered || Number(value) || 0;
  const sizes = { sm: "size-3.5", md: "size-5", lg: "size-7" };
  return <div className={cn("flex flex-wrap items-center gap-2", className)} onMouseLeave={() => setHovered(0)}>
    <div className="flex gap-0.5" aria-label={`${t("common.rating", { defaultValue: "Rating" })} ${Number(value).toFixed(1)} / 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        const active = rating <= Math.round(display);
        const icon = <Star className={cn(sizes[size], active ? "fill-amber-400 text-amber-400" : "text-slate-200", editable && "transition group-hover:scale-110")} />;
        return editable ? <button key={rating} type="button" className="group rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500" onMouseEnter={() => setHovered(rating)} onFocus={() => setHovered(rating)} onBlur={() => setHovered(0)} onClick={() => onChange?.(rating)} aria-label={`${rating} / 5`}>{icon}</button> : <span key={rating}>{icon}</span>;
      })}
    </div>
    {showValue && <span className="text-sm font-bold text-slate-800">{Number(value) ? Number(value).toFixed(1) : "—"}</span>}
    {visibleCount !== undefined && <span className="text-xs text-slate-400">{visibleCount} {t("common.reviews", { defaultValue: "reviews" })}</span>}
  </div>;
}
