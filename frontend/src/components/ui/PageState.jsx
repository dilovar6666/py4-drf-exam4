import { AlertCircle, LoaderCircle, PackageOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

const state = {
  loading: [LoaderCircle, "common.loading", "animate-spin text-emerald-600"],
  error: [AlertCircle, "errors.load", "text-red-500"],
  empty: [PackageOpen, "common.empty", "text-slate-400"],
};

export default function PageState({ type = "empty", message, compact = false }) {
  const [Icon, fallback, iconClass] = state[type];
  const { t } = useTranslation();
  return <div className={`flex flex-col items-center justify-center text-center ${compact ? "min-h-32 p-4" : "min-h-64 p-8"}`}><Icon className={`mb-3 size-7 ${iconClass}`} /><p className="text-sm font-medium text-slate-600">{message || t(fallback)}</p></div>;
}
