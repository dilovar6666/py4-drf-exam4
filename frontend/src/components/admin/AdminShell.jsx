import { Menu, X, Bell, Boxes, Building2, ChartNoAxesCombined, ClipboardList, LayoutDashboard, MessageCircle, PackageSearch, Pill, ShieldCheck, Star, TicketCheck, UserCog, UsersRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

const groups = [
  { label: "Обзор", items: [["dashboard", "Dashboard", LayoutDashboard]] },
  { label: "Управление", items: [["pharmacies", "Аптеки", Building2], ["applications", "Заявки аптек", ClipboardList], ["pharmacists", "Фармацевты", UserCog], ["medicines", "Лекарства", Pill], ["categories", "Категории", Boxes], ["inventory", "Остатки и цены", PackageSearch], ["users", "Пользователи", UsersRound]] },
  { label: "Работа", items: [["reservations", "Брони", TicketCheck], ["chats", "Чаты", MessageCircle], ["reviews", "Отзывы", Star], ["notifications", "Уведомления", Bell]] },
  { label: "Аналитика", items: [["analytics", "Analytics", ChartNoAxesCombined]] },
];

function Navigation({ section, onSection, onClose }) {
  return <nav className="admin-navigation space-y-4">{groups.map((group) => <div key={group.label}><p className="admin-sidebar__group px-2 pb-1 text-[9px] font-bold uppercase tracking-[.18em]">{group.label}</p>{group.items.map(([value, label, Icon]) => <button key={value} onClick={() => { onSection(value); onClose?.(); }} className={cn("admin-sidebar__item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold transition", section === value && "is-active")}><Icon className="size-4" />{label}</button>)}</div>)}</nav>;
}

export default function AdminShell({ section, onSection, children }) {
  const [open, setOpen] = useState(false);
  return <div className="admin-layout min-h-[calc(100dvh-72px)] lg:grid lg:grid-cols-[248px_1fr]">
    <aside className="admin-sidebar hidden border-r lg:sticky lg:top-[72px] lg:block lg:h-[calc(100dvh-72px)]"><div className="admin-sidebar__header border-b px-4 py-4"><div className="flex items-center gap-2 text-sm font-extrabold"><ShieldCheck className="size-5 text-teal-600" />PharmaMap Admin</div><p className="admin-sidebar__muted mt-1 text-xs">Операционный центр сервиса</p><Link to="/" className="admin-sidebar__map-link mt-3 inline-flex rounded-lg border px-2.5 py-1.5 text-xs font-bold">На карту</Link></div><div className="h-[calc(100%-122px)] overflow-y-auto px-3 py-4"><Navigation section={section} onSection={onSection} /></div></aside>
    <div className="admin-mobile-bar flex items-center justify-between border-b px-4 py-3 lg:hidden"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal-600">PharmaMap</p><b className="text-sm">Admin workspace</b></div><button className="focus-ring rounded-xl p-2" onClick={() => setOpen(true)} aria-label="Открыть меню админки"><Menu className="size-5" /></button></div>
    {open && <div className="admin-mobile-drawer fixed inset-0 z-[1500] lg:hidden"><button className="absolute inset-0 bg-slate-950/35" aria-label="Закрыть меню" onClick={() => setOpen(false)} /><aside className="admin-sidebar relative z-10 h-full w-[min(88vw,320px)] border-r p-4 shadow-2xl"><div className="mb-6 flex items-center justify-between"><div className="flex items-center gap-2 font-extrabold"><ShieldCheck className="size-5 text-teal-600" />PharmaMap Admin</div><button className="rounded-xl p-2" onClick={() => setOpen(false)} aria-label="Закрыть меню"><X className="size-5" /></button></div><Navigation section={section} onSection={onSection} onClose={() => setOpen(false)} /></aside></div>}
    <main className="min-w-0 p-4 sm:p-6 xl:p-9">{children}</main>
  </div>;
}
