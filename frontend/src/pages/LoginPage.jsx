import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import Button from "../components/ui/Button";
import useAuth from "../context/useAuth";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  async function submit(event) { event.preventDefault(); setError(""); setSubmitting(true); try { await login(form); navigate(location.state?.from?.pathname || "/", { replace: true }); } catch (requestError) { setError(apiErrorMessage(requestError, "Неверное имя пользователя или пароль.")); } finally { setSubmitting(false); } }
  return <AuthLayout eyebrow="С возвращением" title="Войти в PharmaMap" description="Откройте бронирования, сообщения аптек и уведомления о наличии."><form onSubmit={submit} className="space-y-5">{location.state?.registered && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">Аккаунт создан. Теперь войдите.</p>}<FormField label="Имя пользователя или email-логин" id="username" autoComplete="username" required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /><FormField label="Пароль" id="password" type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" size="lg" className="w-full" disabled={submitting}><LogIn className="size-4" />{submitting ? "Входим..." : "Войти"}</Button><p className="text-center text-sm text-slate-500">Нет аккаунта? <Link className="font-bold text-teal-700 hover:underline" to="/register">Создать бесплатно</Link></p></form></AuthLayout>;
}
