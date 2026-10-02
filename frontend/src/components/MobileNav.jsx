import { Home, MessageCircle, Search, TicketCheck, UserRound } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";
import useNotifications from "../context/useNotifications";

const items = [["/", "Карта", Home], ["/?focus=search", "Поиск", Search], ["/reservations", "Брони", TicketCheck], ["/chats", "Сообщения", MessageCircle], ["/profile", "Профиль", UserRound]];

export default function MobileNav() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  if (!user) return null;
  return <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-[1000] border-t px-2 pt-2 backdrop-blur-xl md:hidden"><div className="mx-auto flex max-w-md justify-around">{items.map(([to, label, Icon], index) => <NavLink key={to} to={to} className={({ isActive }) => `focus-ring relative flex min-w-14 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold ${isActive && (index !== 1 || location.pathname === "/") ? "is-active" : ""}`}><Icon className="size-5" />{label}{index === 3 && unreadCount > 0 && <span className="absolute right-1/4 top-0 grid min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[9px] text-white">{Math.min(unreadCount, 99)}</span>}</NavLink>)}</div></nav>;
}
