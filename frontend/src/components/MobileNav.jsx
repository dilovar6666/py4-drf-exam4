import { Bell, Home, MessageCircle, TicketCheck, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import useAuth from "../context/useAuth";

const items = [
  ["/", "Поиск", Home], ["/reservations", "Брони", TicketCheck],
  ["/chats", "Чаты", MessageCircle], ["/notifications", "События", Bell], ["/profile", "Профиль", UserRound],
];

export default function MobileNav() {
  const { user } = useAuth();
  if (!user) return null;
  return <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-slate-200 bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"><div className="mx-auto flex max-w-md justify-around">{items.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => `focus-ring flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold ${isActive ? "bg-teal-50 text-teal-800" : "text-slate-500"}`}><Icon className="size-5" />{label}</NavLink>)}</div></nav>;
}
