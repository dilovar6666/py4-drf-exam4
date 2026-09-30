import { HeartPulse, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../context/useAuth";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }) => `focus-ring rounded-lg px-3 py-2 ${isActive ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:text-slate-900"}`;
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link to="/" className="focus-ring flex items-center gap-2 rounded-lg font-bold text-emerald-800"><span className="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white"><HeartPulse className="size-5" /></span>PharmaMap</Link>
        <button aria-label="Открыть меню" className="focus-ring rounded-lg p-2 text-slate-600 md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-16 flex-col gap-1 border-b border-slate-200 bg-white p-4 text-sm font-medium shadow-lg md:static md:flex md:flex-row md:border-0 md:p-0 md:shadow-none`} onClick={() => setOpen(false)}>
          <NavLink to="/" className={linkClass}>Главная</NavLink>
          {!loading && (user ? <><NavLink to="/reservations" className={linkClass}>Брони</NavLink><NavLink to="/profile" className={linkClass}>Профиль</NavLink><button onClick={logout} className="focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900"><LogOut className="size-4" />Выйти</button></> : <><NavLink to="/login" className={linkClass}>Войти</NavLink><Link to="/register" className="focus-ring rounded-xl bg-emerald-700 px-4 py-2 text-center text-white hover:bg-emerald-800">Регистрация</Link></>)}
        </nav>
      </div>
    </header>
  );
}
