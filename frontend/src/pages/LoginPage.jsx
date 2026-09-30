import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { apiErrorMessage } from "../api/axios";
import FormField from "../components/FormField";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import useAuth from "../context/useAuth";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try { await login(form); navigate(location.state?.from?.pathname || "/", { replace: true }); }
    catch (requestError) { setError(apiErrorMessage(requestError, "Неверное имя пользователя или пароль.")); }
    finally { setSubmitting(false); }
  }

  return <AuthLayout title="С возвращением" text="Войдите, чтобы бронировать лекарства."><form onSubmit={handleSubmit} className="space-y-4"><FormField label="Имя пользователя" id="username" autoComplete="username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /><FormField label="Пароль" id="password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" className="w-full" disabled={submitting}><LogIn className="size-4" />{submitting ? "Входим..." : "Войти"}</Button><p className="text-center text-sm text-slate-500">Нет аккаунта? <Link className="font-semibold text-emerald-700 hover:underline" to="/register">Зарегистрироваться</Link></p></form></AuthLayout>;
}

function AuthLayout({ title, text, children }) { return <div className="page-shell grid min-h-[calc(100vh-4rem)] place-items-center py-12"><Card className="w-full max-w-md"><CardContent className="p-7 sm:p-9"><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="mb-7 mt-2 text-sm text-slate-500">{text}</p>{children}</CardContent></Card></div>; }
