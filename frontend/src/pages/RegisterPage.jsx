import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiErrorMessage } from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import Button from "../components/ui/Button";
import useAuth from "../context/useAuth";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try { await register(form); navigate("/verify-email", { replace: true, state: { email: form.email } }); }
    catch (requestError) { setError(apiErrorMessage(requestError, t("auth.registerError", { defaultValue: "Не удалось зарегистрироваться." }))); }
    finally { setSubmitting(false); }
  }
  return <AuthLayout eyebrow={t("auth.newAccount", { defaultValue: "Новый аккаунт" })} title={t("auth.registerTitle", { defaultValue: "Присоединиться к PharmaMap" })} description={t("auth.registerDescription", { defaultValue: "Создайте профиль, чтобы бронировать лекарства и общаться с аптеками." })}>
    <form onSubmit={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2">
      <FormField label={t("auth.username", { defaultValue: "Имя пользователя" })} id="username" required autoComplete="username" value={form.username} onChange={update} />
      <FormField label="Email" id="email" type="email" required autoComplete="email" value={form.email} onChange={update} />
    </div><FormField label={t("common.phone")} id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} />
      <FormField label={t("auth.password", { defaultValue: "Пароль" })} id="password" type="password" required minLength="8" autoComplete="new-password" value={form.password} onChange={update} />
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}><UserPlus className="size-4" />{submitting ? t("auth.creating", { defaultValue: "Создаём аккаунт…" }) : t("auth.create", { defaultValue: "Создать аккаунт" })}</Button>
      <p className="text-center text-sm text-slate-500">{t("auth.already", { defaultValue: "Уже зарегистрированы?" })} <Link className="font-bold text-teal-700 hover:underline" to="/login">{t("nav.login")}</Link></p>
    </form>
  </AuthLayout>;
}
