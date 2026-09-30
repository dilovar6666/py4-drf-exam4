import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { apiErrorMessage } from "../api/axios";
import FormField from "../components/FormField";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import useAuth from "../context/useAuth";

const initialForm = { username: "", email: "", phone: "", password: "" };

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try { await register(form); navigate("/login", { replace: true, state: { registered: true } }); }
    catch (requestError) { setError(apiErrorMessage(requestError, "Не удалось зарегистрироваться.")); }
    finally { setSubmitting(false); }
  }

  return <div className="page-shell grid min-h-[calc(100vh-4rem)] place-items-center py-12"><Card className="w-full max-w-lg"><CardContent className="p-7 sm:p-9"><h1 className="text-2xl font-bold tracking-tight">Создать аккаунт</h1><p className="mb-7 mt-2 text-sm text-slate-500">Зарегистрируйтесь, чтобы бронировать лекарства.</p><form onSubmit={handleSubmit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><FormField label="Имя пользователя" id="username" required autoComplete="username" value={form.username} onChange={update} /><FormField label="Email" id="email" type="email" required autoComplete="email" value={form.email} onChange={update} /></div><FormField label="Телефон" id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} /><FormField label="Пароль" id="password" type="password" required minLength="8" autoComplete="new-password" value={form.password} onChange={update} />{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" className="w-full" disabled={submitting}><UserPlus className="size-4" />{submitting ? "Создаём аккаунт..." : "Зарегистрироваться"}</Button><p className="text-center text-sm text-slate-500">Уже есть аккаунт? <Link className="font-semibold text-emerald-700 hover:underline" to="/login">Войти</Link></p></form></CardContent></Card></div>;
}
