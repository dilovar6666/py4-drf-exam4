import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import Button from "../components/ui/Button";
import useAuth from "../context/useAuth";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) { event.preventDefault(); setError(""); setSubmitting(true); try { await register(form); navigate("/login", { replace: true, state: { registered: true } }); } catch (requestError) { setError(apiErrorMessage(requestError, "Не удалось зарегистрироваться.")); } finally { setSubmitting(false); } }
  return <AuthLayout eyebrow="Новый аккаунт" title="Присоединиться к PharmaMap" description="Создайте профиль, чтобы бронировать лекарства и общаться с аптеками."><form onSubmit={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><FormField label="Имя пользователя" id="username" required autoComplete="username" value={form.username} onChange={update} /><FormField label="Email" id="email" type="email" required autoComplete="email" value={form.email} onChange={update} /></div><FormField label="Телефон" id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} /><FormField label="Пароль" id="password" type="password" required minLength="8" autoComplete="new-password" value={form.password} onChange={update} />{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" size="lg" className="w-full" disabled={submitting}><UserPlus className="size-4" />{submitting ? "Создаём аккаунт..." : "Создать аккаунт"}</Button><p className="text-center text-sm text-slate-500">Уже зарегистрированы? <Link className="font-bold text-teal-700 hover:underline" to="/login">Войти</Link></p></form></AuthLayout>;
}
