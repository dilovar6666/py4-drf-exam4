import { AnimatePresence, motion } from "framer-motion";
import { Bell, HeartPulse, LogOut, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { mediaUrl } from "../api/axios";
import useAuth from "../context/useAuth";
import useNotifications from "../context/useNotifications";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import ThemeSwitch from "./ThemeSwitch";

const publicLinks = [{ to: "/", label: "Поиск" }, { to: "/leaderboard", label: "Рейтинги" }];
const privateLinks = [{ to: "/reservations", label: "Брони" }, { to: "/chats", label: "Сообщения" }, { to: "/pharmacy-applications", label: "Добавить аптеку" }];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin-panel");
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }) => `focus-ring rounded-xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`;
  const links = user ? [...publicLinks, ...privateLinks, ...(user.role === "pharmacist" && !user.is_staff ? [{ to: "/pharmacist-workspace", label: "Рабочее место" }] : []), ...(user.is_staff ? [{ to: "/admin-panel", label: "Admin" }] : [])] : publicLinks;

  return <header className={`app-navbar sticky top-0 z-[1000] border-b backdrop-blur-xl ${isAdmin ? "is-admin" : "border-slate-200/80 bg-white/92"}`}>
    <div className="page-shell flex h-[72px] items-center justify-between gap-5">
      <Link to="/" className="focus-ring flex items-center gap-2.5 rounded-xl"><span className="grid size-10 place-items-center rounded-[14px] bg-teal-700 text-white shadow-lg shadow-teal-700/20"><HeartPulse className="size-5" /></span><span><span className="block text-[17px] font-extrabold tracking-[-.025em] text-slate-950">PharmaMap</span><span className="hidden text-[10px] font-semibold uppercase tracking-[.16em] text-teal-700 sm:block">лекарства рядом</span></span></Link>
      <nav className="hidden items-center gap-1 md:flex">{links.map((item) => <NavLink key={item.to} to={item.to} className={linkClass}>{item.label}</NavLink>)}</nav>
      <div className="hidden items-center gap-2 md:flex"><ThemeSwitch />{!loading && (user ? <>
        <Button asChild variant="ghost" size="icon" className="relative"><Link to="/notifications" aria-label="Уведомления"><Bell className="size-5" />{unreadCount > 0 && <span className="absolute right-0 top-0 grid min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">{Math.min(unreadCount, 99)}</span>}</Link></Button>
        <Button asChild variant="ghost" className="h-11 px-2"><Link to="/profile"><Avatar src={user.avatar ? mediaUrl(user.avatar) : undefined} fallback={user.username?.slice(0, 1).toUpperCase()} className="size-8" /><span className="max-w-32 truncate">{user.username}</span></Link></Button>
        <Button onClick={logout} variant="ghost" size="icon" aria-label="Выйти"><LogOut className="size-5" /></Button>
      </> : <><Button asChild variant="ghost"><Link to="/login">Войти</Link></Button><Button asChild><Link to="/register">Создать аккаунт</Link></Button></>)}</div>
      <div className="flex items-center gap-1 md:hidden">{user && <Link to="/profile" className="focus-ring rounded-xl"><Avatar src={user.avatar ? mediaUrl(user.avatar) : undefined} fallback={user.username?.slice(0, 1).toUpperCase()} className="size-8" /></Link>}<ThemeSwitch /><button className="focus-ring rounded-xl p-2 text-slate-600" onClick={() => setOpen((value) => !value)} aria-label={open ? "Закрыть меню" : "Открыть меню"}>{open ? <X /> : <Menu />}</button></div>
    </div>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="border-t border-slate-100 bg-white p-4 shadow-xl md:hidden"><nav className="page-shell flex flex-col gap-1" onClick={() => setOpen(false)}>{links.map((item) => <NavLink key={item.to} to={item.to} className={linkClass}>{item.label}</NavLink>)}{user ? <><NavLink to="/notifications" className={linkClass}><span className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><Bell className="size-4" />Уведомления</span>{unreadCount > 0 && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{unreadCount}</span>}</span></NavLink><NavLink to="/profile" className={linkClass}><span className="flex items-center gap-2"><UserRound className="size-4" />Профиль</span></NavLink><button className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-left text-sm font-semibold text-slate-600" onClick={logout}><LogOut className="size-4" />Выйти</button></> : <div className="mt-2 grid grid-cols-2 gap-2"><Button asChild variant="secondary"><Link to="/login">Войти</Link></Button><Button asChild><Link to="/register">Регистрация</Link></Button></div>}</nav></motion.div>}</AnimatePresence>
  </header>;
}
