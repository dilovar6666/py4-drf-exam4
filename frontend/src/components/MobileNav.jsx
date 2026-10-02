import { Home, MessageCircle, Search, TicketCheck, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";
import useNotifications from "../context/useNotifications";

export default function MobileNav() {
  const { t } = useTranslation(); const { user } = useAuth(); const { unreadCount } = useNotifications(); const location = useLocation();
  if (!user) return null;
  const items = [["/", t("nav.map"), Home], ["/?focus=search", t("nav.search"), Search], ["/reservations", t("nav.reservations"), TicketCheck], ["/chats", t("nav.messages"), MessageCircle], ["/profile", t("nav.profile"), UserRound]];
  return <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-[1000] border-t px-2 pt-2 backdrop-blur-xl md:hidden"><div className="mx-auto flex max-w-md justify-around">{items.map(([to, label, Icon], index) => <NavLink key={to} to={to} className={({ isActive }) => `focus-ring relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-center text-[10px] font-bold leading-tight ${isActive && (index !== 1 || location.pathname === "/") ? "is-active" : ""}`}><Icon className="size-5 shrink-0" />{label}{index === 3 && unreadCount > 0 && <span className="absolute right-1/4 top-0 grid min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[9px] text-white">{Math.min(unreadCount, 99)}</span>}</NavLink>)}</div></nav>;
}
