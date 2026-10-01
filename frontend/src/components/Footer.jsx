import { HeartPulse } from "lucide-react";

export default function Footer() {
  return <footer className="border-t border-slate-200 bg-white py-8"><div className="page-shell flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 font-bold text-slate-800"><HeartPulse className="size-4 text-teal-700" />PharmaMap</div><p>Сервис показывает справочную информацию о наличии и ценах.</p><p>© 2026 PharmaMap</p></div></footer>;
}
