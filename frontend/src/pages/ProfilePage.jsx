import { AtSign, Phone, Shield, User } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import useAuth from "../context/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  return <div className="page-shell py-10 sm:py-14"><span className="text-sm font-semibold text-emerald-700">Личный кабинет</span><h1 className="mt-1 text-3xl font-bold tracking-tight">Профиль</h1><Card className="mt-7 max-w-2xl"><CardContent className="p-7"><div className="mb-7 flex items-center gap-4"><span className="grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><User className="size-8" /></span><div><h2 className="text-xl font-semibold">{user.username}</h2><p className="text-sm text-slate-500">Участник PharmaMap</p></div></div><dl className="grid gap-3 sm:grid-cols-2"><ProfileItem icon={AtSign} label="Email" value={user.email || "Не указан"} /><ProfileItem icon={Phone} label="Телефон" value={user.phone || "Не указан"} /><ProfileItem icon={Shield} label="Роль" value={user.role === "pharmacist" ? "Фармацевт" : "Пользователь"} /></dl></CardContent></Card></div>;
}

function ProfileItem({ icon: Icon, label, value }) { return <div className="rounded-xl bg-slate-50 p-4"><dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><Icon className="size-4 text-emerald-600" />{label}</dt><dd className="mt-2 font-medium text-slate-800">{value}</dd></div>; }
