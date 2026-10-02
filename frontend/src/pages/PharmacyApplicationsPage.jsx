import { Building2, CheckCircle2, Clock3, MapPin, Send } from "lucide-react";
import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../api/axios";
import PageHeader from "../components/PageHeader";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import PageState from "../components/ui/PageState";

const initialForm = { name: "", address: "", latitude: "38.573", longitude: "68.786", phone: "", opening_time: "08:00", closing_time: "22:00", is_24_hours: false, description: "" };
const statusVariant = { pending: "warning", approved: "success", rejected: "danger" };
const statusLabel = { pending: "На рассмотрении", approved: "Одобрена", rejected: "Отклонена" };

export default function PharmacyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("loading");
  const [submitState, setSubmitState] = useState({});
  useEffect(() => {
    let active = true;
    api.get("pharmacy-applications/").then(({ data }) => { if (active) { setApplications(data); setStatus("ready"); } }).catch(() => active && setStatus("error"));
    return () => { active = false; };
  }, []);
  function change(event) { const { name, value, type, checked } = event.target; setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value })); }
  async function submit(event) {
    event.preventDefault(); setSubmitState({ loading: true });
    try {
      const payload = { ...form, opening_time: form.is_24_hours ? null : form.opening_time, closing_time: form.is_24_hours ? null : form.closing_time };
      const { data } = await api.post("pharmacy-applications/", payload);
      setApplications((items) => [data, ...items]); setForm(initialForm); setSubmitState({ success: "Заявка отправлена на рассмотрение." });
    } catch (error) { setSubmitState({ error: apiErrorMessage(error, "Не удалось отправить заявку.") }); }
  }
  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить заявки" />;
  return <div className="page-shell py-10 pb-28 sm:py-14"><PageHeader eyebrow="Партнёрам PharmaMap" title="Добавить аптеку" description="Отправьте данные на проверку. После одобрения аптека появится на карте, а заявитель будет связан с ней как работник." /><div className="grid gap-6 xl:grid-cols-[1fr_380px]"><Card><CardContent className="p-6 sm:p-8"><form onSubmit={submit} className="grid gap-5 sm:grid-cols-2"><Field label="Название"><Input name="name" value={form.name} onChange={change} required /></Field><Field label="Телефон"><Input name="phone" value={form.phone} onChange={change} placeholder="+992..." /></Field><Field label="Адрес" className="sm:col-span-2"><Input name="address" value={form.address} onChange={change} required /></Field><Field label="Широта"><Input name="latitude" type="number" step="0.000001" value={form.latitude} onChange={change} required /></Field><Field label="Долгота"><Input name="longitude" type="number" step="0.000001" value={form.longitude} onChange={change} required /></Field><Field label="Открытие"><Input name="opening_time" type="time" value={form.opening_time} onChange={change} disabled={form.is_24_hours} /></Field><Field label="Закрытие"><Input name="closing_time" type="time" value={form.closing_time} onChange={change} disabled={form.is_24_hours} /></Field><label className="flex items-center gap-3 rounded-2xl bg-teal-50 p-4 text-sm font-bold text-teal-900 sm:col-span-2"><input name="is_24_hours" type="checkbox" checked={form.is_24_hours} onChange={change} className="size-5 accent-teal-700" />Аптека работает круглосуточно</label><Field label="Описание" className="sm:col-span-2"><textarea name="description" rows="5" value={form.description} onChange={change} className="focus-ring w-full rounded-xl border border-slate-200 p-3" /></Field>{submitState.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{submitState.error}</p>}{submitState.success && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 sm:col-span-2"><CheckCircle2 className="size-4" />{submitState.success}</p>}<div className="sm:col-span-2"><Button type="submit" disabled={submitState.loading}><Send className="size-4" />{submitState.loading ? "Отправляем..." : "Отправить заявку"}</Button></div></form></CardContent></Card><Card className="h-fit"><CardContent className="p-6"><h2 className="flex items-center gap-2 font-extrabold"><Building2 className="size-5 text-teal-700" />Мои заявки</h2><div className="mt-5 space-y-3">{applications.length ? applications.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><b className="text-sm text-slate-900">{item.name}</b><p className="mt-1 flex gap-1 text-xs text-slate-500"><MapPin className="size-3" />{item.address}</p></div><Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge></div><p className="mt-3 flex items-center gap-1 text-[11px] text-slate-400"><Clock3 className="size-3" />{new Date(item.created_at).toLocaleString("ru-RU")}</p></div>) : <PageState type="empty" message="Вы ещё не отправляли заявки" compact />}</div></CardContent></Card></div></div>;
}

function Field({ label, className = "", children }) { return <label className={`block text-sm font-semibold text-slate-700 ${className}`}>{label}<div className="mt-2">{children}</div></label>; }
