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
  return <div className="admin-layout min-h-[calc(100dvh-72px)] lg:grid lg:grid-cols-[248px_1fr]">
    <aside className="admin-sidebar border-b lg:sticky lg:top-[72px] lg:h-[calc(100dvh-72px)] lg:border-b-0 lg:border-r">
      <div className="admin-sidebar__header flex items-center justify-between border-b px-4 py-4 lg:block">
        <div><div className="flex items-center gap-2 text-sm font-extrabold"><ShieldCheck className="size-5 text-teal-600" />PharmaMap Admin</div><p className="admin-sidebar__muted mt-1 text-xs">Операционный центр сервиса</p></div>
        <Link to="/" className="admin-sidebar__map-link rounded-lg border px-2.5 py-1.5 text-xs font-bold lg:mt-3 lg:inline-flex">На карту</Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 py-2 lg:block lg:h-[calc(100%-96px)] lg:space-y-4 lg:overflow-y-auto lg:px-3 lg:py-4">
        {groups.map((group) => <div key={group.label} className="flex shrink-0 gap-0.5 lg:block lg:space-y-0.5">
          <p className="admin-sidebar__group hidden px-2 pb-1 text-[9px] font-bold uppercase tracking-[.18em] lg:block">{group.label}</p>
          {group.items.map(([value, label, Icon]) => <button key={value} onClick={() => onSection(value)} className={cn("admin-sidebar__item flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold transition lg:w-full", section === value && "is-active")}><Icon className="size-4" />{label}</button>)}
        </div>)}
      </nav>
    </aside>
    <main className="min-w-0 p-4 sm:p-6 xl:p-9">{children}</main>
  </div>;
}
