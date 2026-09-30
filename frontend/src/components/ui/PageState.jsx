import { AlertCircle, LoaderCircle, PackageOpen } from "lucide-react";

const state = {
  loading: [LoaderCircle, "Загрузка...", "animate-spin text-emerald-600"],
  error: [AlertCircle, "Не удалось загрузить данные", "text-red-500"],
  empty: [PackageOpen, "Ничего не найдено", "text-slate-400"],
};

export default function PageState({ type = "empty", message, compact = false }) {
  const [Icon, fallback, iconClass] = state[type];
  return <div className={`flex flex-col items-center justify-center text-center ${compact ? "min-h-32 p-4" : "min-h-64 p-8"}`}><Icon className={`mb-3 size-7 ${iconClass}`} /><p className="text-sm font-medium text-slate-600">{message || fallback}</p></div>;
}
