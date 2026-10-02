import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ compact = false }) {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage || "ru";
  return <label className={`inline-flex items-center gap-2 ${compact ? "" : "rounded-xl border border-slate-200 px-2"}`} title={t("language.label")}>
    <Languages className="size-4 text-teal-600" />
    <select aria-label={t("language.label")} value={language} onChange={(event) => i18n.changeLanguage(event.target.value)} className="h-9 cursor-pointer border-0 bg-transparent px-1 text-xs font-bold outline-none">
      <option value="ru">RU</option><option value="tj">TJ</option><option value="en">EN</option>
    </select>
  </label>;
}
