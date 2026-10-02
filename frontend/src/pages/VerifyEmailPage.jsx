import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { apiErrorMessage } from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/ui/Button";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!seconds) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  async function verify(event) {
    event.preventDefault(); setError(""); setMessage(""); setSubmitting(true);
    try {
      await api.post("auth/verify-email/", { email, code });
      setMessage(t("verification.verified"));
      window.setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (requestError) { setError(apiErrorMessage(requestError, t("verification.invalid"))); }
    finally { setSubmitting(false); }
  }

  async function resend() {
    if (seconds || !email) return;
    setError(""); setMessage("");
    try {
      await api.post("auth/resend-email-code/", { email });
      setMessage(t("verification.sent")); setSeconds(60);
    } catch (requestError) { setError(apiErrorMessage(requestError, t("verification.invalid"))); }
  }

  return <AuthLayout eyebrow="PharmaMap" title={t("verification.title")} description={t("verification.description", { email: email || "email" })}>
    <form onSubmit={verify} className="space-y-4">
      <label className="block text-sm font-semibold">Email<input className="focus-ring mt-2 min-h-11 w-full rounded-xl border px-3 text-base" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label className="block text-sm font-semibold">{t("verification.code")}<input className="focus-ring mt-2 min-h-11 w-full rounded-xl border px-3 text-base tracking-[.35em]" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>{submitting ? t("common.loading") : <><MailCheck className="size-4" />{t("verification.verify")}</>}</Button>
      <Button type="button" variant="secondary" className="w-full" onClick={resend} disabled={!email || Boolean(seconds)}>{seconds ? t("verification.cooldown", { seconds }) : t("verification.resend")}</Button>
      <p className="text-center text-sm"><Link className="font-bold text-teal-700 hover:underline" to="/login">{t("verification.back")}</Link></p>
    </form>
  </AuthLayout>;
}
