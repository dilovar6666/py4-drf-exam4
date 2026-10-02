import {
  Bell, Boxes, Building2, ChartNoAxesCombined, ClipboardList, LayoutDashboard,
  MessageCircle, PackageSearch, Pill, ShieldCheck, Star, TicketCheck, UserCog, UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

const groups = [
  { label: "Обзор", items: [["dashboard", "Dashboard", LayoutDashboard]] },
  { label: "Управление", items: [
    ["pharmacies", "Аптеки", Building2], ["applications", "Заявки аптек", ClipboardList],
    ["pharmacists", "Фармацевты", UserCog], ["medicines", "Лекарства", Pill],
    ["categories", "Категории", Boxes], ["inventory", "Остатки и цены", PackageSearch],
    ["users", "Пользователи", UsersRound],
  ] },
  { label: "Работа", items: [
    ["reservations", "Брони", TicketCheck], ["chats", "Чаты", MessageCircle],
    ["reviews", "Отзывы", Star], ["notifications", "Уведомления", Bell],
  ] },
  { label: "Аналитика", items: [["analytics", "Analytics", ChartNoAxesCombined]] },
];

export default function AdminShell({ section, onSection, children }) {
  return <div className="min-h-[calc(100dvh-72px)] bg-slate-100 lg:grid lg:grid-cols-[276px_1fr]">
    <aside className="border-b border-slate-800 bg-slate-950 text-white lg:sticky lg:top-[72px] lg:h-[calc(100dvh-72px)] lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between border-b border-white/8 p-5 lg:block">
        <div><div className="flex items-center gap-2 text-sm font-extrabold"><ShieldCheck className="size-5 text-teal-300" />PharmaMap Admin</div><p className="mt-1 text-xs text-slate-400">Операционный центр сервиса</p></div>
        <Link to="/" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 lg:mt-4 lg:inline-flex">На карту</Link>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:block lg:h-[calc(100%-112px)] lg:space-y-5 lg:overflow-y-auto lg:px-4">
        {groups.map((group) => <div key={group.label} className="flex shrink-0 gap-1 lg:block lg:space-y-1">
          <p className="hidden px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-slate-600 lg:block">{group.label}</p>
          {group.items.map(([value, label, Icon]) => <button key={value} onClick={() => onSection(value)} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition lg:w-full", section === value ? "bg-teal-600 text-white shadow-lg shadow-teal-950/25" : "text-slate-400 hover:bg-white/7 hover:text-white")}><Icon className="size-4" />{label}</button>)}
        </div>)}
      </nav>
    </aside>
    <main className="min-w-0 p-4 sm:p-6 xl:p-9">{children}</main>
  </div>;
}
