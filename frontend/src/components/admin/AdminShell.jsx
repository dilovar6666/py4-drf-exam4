import { Activity, Bell, Boxes, Building2, ChartNoAxesCombined, LayoutDashboard, MessageCircle, PackageSearch, Pill, ShieldCheck, Star, TicketCheck, UserCog, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

const navigation = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["pharmacies", "Аптеки", Building2],
  ["pharmacists", "Фармацевты", UserCog],
  ["medicines", "Лекарства", Pill],
  ["categories", "Категории", Boxes],
  ["inventory", "Остатки и цены", PackageSearch],
  ["reservations", "Брони", TicketCheck],
  ["reviews", "Отзывы", Star],
  ["chats", "Чаты", MessageCircle],
  ["users", "Пользователи", UsersRound],
  ["notifications", "Уведомления", Bell],
  ["analytics", "Аналитика", ChartNoAxesCombined],
  ["ratings", "Рейтинги", Activity],
];

export default function AdminShell({ section, onSection, children }) {
  return <div className="min-h-[calc(100dvh-72px)] bg-slate-100 lg:grid lg:grid-cols-[268px_1fr]">
    <aside className="border-b border-slate-200 bg-slate-950 text-white lg:sticky lg:top-[72px] lg:h-[calc(100dvh-72px)] lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between p-5 lg:block"><div><div className="flex items-center gap-2 text-sm font-extrabold"><ShieldCheck className="size-5 text-teal-300" />PharmaMap Admin</div><p className="mt-1 text-xs text-slate-400">Управление сервисом</p></div><Link to="/" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10">На карту</Link></div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:block lg:h-[calc(100%-92px)] lg:space-y-1 lg:overflow-y-auto">{navigation.map(([value, label, Icon]) => <button key={value} onClick={() => onSection(value)} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition lg:w-full", section === value ? "bg-teal-600 text-white shadow-lg shadow-teal-950/20" : "text-slate-400 hover:bg-white/7 hover:text-white")}><Icon className="size-4" />{label}</button>)}</nav>
    </aside>
    <main className="min-w-0 p-4 sm:p-6 xl:p-9">{children}</main>
  </div>;
}
