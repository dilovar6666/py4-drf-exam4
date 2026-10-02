import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { apiErrorMessage } from "../../api/axios";
import { formatPrice } from "../../lib/currency";
import StarRating from "../StarRating";
import StatusBadge from "../StatusBadge";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/Dialog";
import Input from "../ui/Input";
import PageState from "../ui/PageState";
import { AdminHeading } from "./AdminDashboard";

const resourceConfigs = {
  pharmacies: { title: "Аптеки", endpoint: "pharmacies/", columns: [["name", "Название"], ["address", "Адрес"], ["phone", "Телефон"], ["is_24_hours", "24/7"]], fields: [["name", "Название"], ["address", "Адрес"], ["latitude", "Широта", "number"], ["longitude", "Долгота", "number"], ["phone", "Телефон"], ["opening_time", "Открытие", "time"], ["closing_time", "Закрытие", "time"], ["is_24_hours", "Круглосуточно", "checkbox"], ["description", "Описание", "textarea"], ["image", "Изображение", "file"]] },
  categories: { title: "Категории", endpoint: "categories/", columns: [["name", "Название"]], fields: [["name", "Название"]] },
  medicines: { title: "Лекарства", endpoint: "medicines/", columns: [["name", "Название"], ["active_ingredient", "Действующее вещество"], ["dosage", "Дозировка"], ["manufacturer", "Производитель"], ["barcode", "Штрихкод"]], fields: [["name", "Название"], ["category", "Категория", "category"], ["active_ingredient", "Действующее вещество"], ["dosage", "Дозировка"], ["form", "Форма"], ["manufacturer", "Производитель"], ["barcode", "Штрихкод"], ["description", "Описание", "textarea"], ["image", "Изображение", "file"]] },
  inventory: { title: "Остатки и цены", endpoint: "pharmacy-medicines/", columns: [["pharmacy", "Аптека"], ["medicine", "Лекарство"], ["price", "Цена"], ["quantity", "Количество"], ["updated_at", "Обновлено"]], fields: [["pharmacy", "Аптека", "pharmacy"], ["medicine", "Лекарство", "medicine"], ["price", "Цена TJS", "number"], ["quantity", "Количество", "number"]] },
  users: { title: "Пользователи", endpoint: "users/", columns: [["username", "Логин"], ["email", "Email"], ["phone", "Телефон"], ["role", "Роль"], ["is_staff", "Staff"]], fields: [["username", "Логин"], ["email", "Email", "email"], ["phone", "Телефон"], ["role", "Роль", "role"], ["is_staff", "Staff", "checkbox"], ["password", "Пароль", "password"]] },
};

export default function AdminManagement({ section, data, setData }) {
  if (resourceConfigs[section]) return <ResourceManager section={section} config={resourceConfigs[section]} data={data} setData={setData} />;
  if (section === "applications") return <ApplicationManager data={data} setData={setData} />;
  if (section === "pharmacists") return <PharmacistManager data={data} setData={setData} />;
  if (section === "reservations") return <ReservationManager data={data} setData={setData} />;
  if (section === "reviews") return <ReviewManager data={data} setData={setData} />;
  if (section === "chats") return <ChatManager data={data} setData={setData} />;
  if (section === "notifications") return <NotificationManager data={data} setData={setData} />;
  return <PageState type="empty" message="Раздел готовится" />;
}

function ApplicationManager({ data, setData }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  async function decide(item, action) {
    setBusy(item.id); setError("");
    try {
      const response = await api.post(`pharmacy-applications/${item.id}/${action}/`);
      setData((current) => {
        const applications = current.applications.map((entry) => entry.id === response.data.id ? response.data : entry);
        return { ...current, applications };
      });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Не удалось обработать заявку."));
    } finally { setBusy(null); }
  }
  return <div>
    <AdminHeading eyebrow="Модерация" title="Заявки аптек" description="Проверяйте данные заявки до создания аптеки и назначения заявителя фармацевтом." />
    {error && <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="grid gap-4">{data.applications.map((item) => <Card key={item.id}><CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-extrabold">{item.name}</h2><StatusBadge status={item.status} /></div><p className="mt-2 text-sm text-slate-600">{item.address}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500"><span>Заявитель: {item.applicant_username}</span><span>{item.phone || "Телефон не указан"}</span><span>{new Date(item.created_at).toLocaleString("ru-RU")}</span></div>{item.description && <p className="mt-3 max-w-3xl text-sm text-slate-500">{item.description}</p>}</div>{item.status === "pending" && <div className="flex gap-2"><Button variant="secondary" disabled={busy === item.id} onClick={() => decide(item, "reject")}>Отклонить</Button><Button disabled={busy === item.id} onClick={() => decide(item, "approve")}>Одобрить</Button></div>}</CardContent></Card>)}{!data.applications.length && <PageState type="empty" message="Заявок пока нет" />}</div>
  </div>;
}

function ResourceManager({ section, config, data, setData }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const rows = useMemo(() => data[section].filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [data, query, section]);
  function open(item = {}) { setEditing(item.id || "new"); setForm(item); setError(""); }
  async function save(event) {
    event.preventDefault(); setError("");
    const hasFile = Object.values(form).some((value) => value instanceof File);
    let payload = form;
    if (hasFile) { payload = new FormData(); Object.entries(form).forEach(([key, value]) => { if (value !== "" && value !== null && !(key === "id")) payload.append(key, value); }); }
    else { payload = Object.fromEntries(Object.entries(form).filter(([key, value]) => key !== "id" && key !== "created_at" && key !== "updated_at" && value !== "" && !(key === "image" && typeof value === "string"))); }
    try {
      const response = editing === "new" ? await api.post(config.endpoint, payload) : await api.patch(`${config.endpoint}${editing}/`, payload);
      setData((current) => ({ ...current, [section]: editing === "new" ? [...current[section], response.data] : current[section].map((item) => item.id === response.data.id ? response.data : item) }));
      setEditing(null);
    } catch (requestError) { setError(apiErrorMessage(requestError, "Не удалось сохранить запись.")); }
  }
  async function remove(item) {
    if (!window.confirm(`Удалить «${item.name || item.username || item.id}»?`)) return;
    await api.delete(`${config.endpoint}${item.id}/`);
    setData((current) => ({ ...current, [section]: current[section].filter((row) => row.id !== item.id) }));
  }
  return <><AdminHeading eyebrow="Управление" title={config.title} description="Создание, редактирование и удаление через защищённые staff endpoints." actions={<Button onClick={() => open()}><Plus className="size-4" />Добавить</Button>} /><Card><CardContent className="p-0"><div className="flex items-center gap-3 border-b border-slate-200 p-4"><Search className="size-4 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск в таблице" className="border-0 shadow-none" /></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr>{config.columns.map(([, label]) => <th key={label} className="px-4 py-3">{label}</th>)}<th className="px-4 py-3 text-right">Действия</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/70">{config.columns.map(([key]) => <td key={key} className="max-w-64 px-4 py-3 font-medium text-slate-700">{renderValue(section, key, item[key], data)}</td>)}<td className="px-4 py-3"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => open(item)}><Edit3 className="size-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(item)}><Trash2 className="size-4 text-red-600" /></Button></div></td></tr>)}</tbody></table>{!rows.length && <PageState type="empty" message="Записей нет" compact />}</div></CardContent></Card><Dialog open={editing !== null} onOpenChange={(openState) => !openState && setEditing(null)}><DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto"><DialogTitle>{editing === "new" ? "Новая запись" : "Редактирование"}</DialogTitle><DialogDescription>{config.title}: данные сохраняются напрямую в API.</DialogDescription><form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">{config.fields.map(([key, label, type = "text"]) => <Field key={key} name={key} label={label} type={type} value={form[key]} data={data} onChange={(value) => setForm((current) => ({ ...current, [key]: value }))} />)}{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}<div className="flex justify-end gap-2 sm:col-span-2"><Button variant="secondary" onClick={() => setEditing(null)}>Отмена</Button><Button type="submit">Сохранить</Button></div></form></DialogContent></Dialog></>;
}

function Field({ name, label, type, value, data, onChange }) {
  if (type === "checkbox") return <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold"><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
  const options = type === "category" ? data.categories : type === "pharmacy" ? data.pharmacies : type === "medicine" ? data.medicines : null;
  if (options) return <label className="text-sm font-semibold text-slate-700">{label}<select value={value || ""} onChange={(event) => onChange(Number(event.target.value))} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3"><option value="">Выберите</option>{options.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>;
  if (type === "role") return <label className="text-sm font-semibold text-slate-700">{label}<select value={value || "user"} onChange={(event) => onChange(event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3"><option value="user">Пользователь</option><option value="pharmacist">Фармацевт</option></select></label>;
  if (type === "textarea") return <label className="text-sm font-semibold text-slate-700 sm:col-span-2">{label}<textarea rows="4" value={value || ""} onChange={(event) => onChange(event.target.value)} className="focus-ring mt-2 w-full rounded-xl border border-slate-200 p-3" /></label>;
  if (type === "file") return <label className="text-sm font-semibold text-slate-700 sm:col-span-2">{label}<Input name={name} type="file" accept="image/*" className="mt-2" onChange={(event) => onChange(event.target.files[0])} /></label>;
  return <label className="text-sm font-semibold text-slate-700">{label}<Input name={name} type={type} step={type === "number" ? "any" : undefined} value={value || ""} onChange={(event) => onChange(event.target.value)} className="mt-2" /></label>;
}

function PharmacistManager({ data, setData }) {
  const pharmacists = data.users.filter((user) => user.role === "pharmacist");
  const [form, setForm] = useState({ username: "", password: "", email: "", pharmacy: "" });
  const [error, setError] = useState("");
  async function add(event) { event.preventDefault(); try { const { pharmacy, ...userPayload } = form; const { data: created } = await api.post("users/", { ...userPayload, role: "pharmacist" }); const { data: worker } = await api.post("pharmacy-workers/", { user: created.id, pharmacy: Number(pharmacy) }); setData((current) => ({ ...current, users: [...current.users, created], workers: [...current.workers, worker], pharmacists: [...current.pharmacists, { ...created, pharmacy: Number(pharmacy), pharmacy_name: current.pharmacies.find((item) => item.id === Number(pharmacy))?.name, rating: null, review_count: 0 }] })); setForm({ username: "", password: "", email: "", pharmacy: "" }); setError(""); } catch (requestError) { setError(apiErrorMessage(requestError, "Не удалось добавить фармацевта.")); } }
  async function unlink(workerId) { await api.delete(`pharmacy-workers/${workerId}/`); setData((current) => ({ ...current, workers: current.workers.filter((item) => item.id !== workerId) })); }
  return <><AdminHeading eyebrow="Команда" title="Фармацевты" description="Аккаунты с ролью pharmacist и их связь с аптекой." /><div className="grid gap-6 xl:grid-cols-[1fr_360px]"><Card><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="p-4">Фармацевт</th><th>Аптека</th><th>Рейтинг</th><th /></tr></thead><tbody>{pharmacists.map((item) => { const worker = data.workers.find((entry) => entry.user === item.id); const rating = data.pharmacists.find((entry) => entry.id === item.id); return <tr key={item.id} className="border-t border-slate-100"><td className="p-4 font-bold">{item.username}<span className="block text-xs font-normal text-slate-400">{item.email}</span></td><td>{data.pharmacies.find((entry) => entry.id === worker?.pharmacy)?.name || "Не назначена"}</td><td><StarRating value={rating?.rating || 0} count={rating?.review_count || 0} size="sm" /></td><td className="p-3 text-right">{worker && <Button size="sm" variant="ghost" onClick={() => unlink(worker.id)}>Удалить связь</Button>}</td></tr>; })}</tbody></table></CardContent></Card><Card><CardContent className="p-6"><h2 className="font-extrabold">Новый фармацевт</h2><form onSubmit={add} className="mt-5 space-y-3"><Input placeholder="Логин" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /><Input type="password" placeholder="Пароль" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /><Input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><select className="focus-ring min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3" value={form.pharmacy} onChange={(event) => setForm({ ...form, pharmacy: event.target.value })} required><option value="">Выберите аптеку</option>{data.pharmacies.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{error && <p className="text-sm text-red-600">{error}</p>}<Button type="submit" className="w-full">Добавить</Button></form></CardContent></Card></div></>;
}

function ReservationManager({ data, setData }) {
  const transitions = { pending: ["confirmed", "cancelled"], confirmed: ["ready", "cancelled"], ready: ["completed", "cancelled"] };
  async function change(item, status) { const { data: updated } = await api.patch(`reservations/${item.id}/`, { status }); setData((current) => ({ ...current, reservations: current.reservations.map((row) => row.id === updated.id ? updated : row) })); }
  return <><AdminHeading eyebrow="Операции" title="Брони" description="Staff видит все брони и выполняет только допустимые переходы статусов." /><Card><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="p-4">ID</th><th>Пользователь</th><th>Inventory</th><th>Количество</th><th>Статус</th><th>Создано</th><th>Действия</th></tr></thead><tbody>{data.reservations.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="p-4 font-bold">#{item.id}</td><td>#{item.user}</td><td>#{item.pharmacy_medicine}</td><td>{item.quantity}</td><td><StatusBadge status={item.status} /></td><td>{new Date(item.created_at).toLocaleString("ru-RU")}</td><td><div className="flex flex-wrap gap-1">{(transitions[item.status] || []).map((status) => <Button key={status} size="sm" variant={status === "cancelled" ? "ghost" : "soft"} onClick={() => change(item, status)}>{status}</Button>)}</div></td></tr>)}</tbody></table></CardContent></Card></>;
}

function ReviewManager({ data, setData }) {
  async function remove(id) { if (!window.confirm("Удалить отзыв?")) return; await api.delete(`reviews/${id}/`); setData((current) => ({ ...current, reviews: current.reviews.filter((item) => item.id !== id) })); }
  return <><AdminHeading eyebrow="Качество" title="Отзывы" description="Модерация отзывов об аптеках." /><div className="grid gap-3">{data.reviews.map((item) => <Card key={item.id}><CardContent className="flex items-start gap-4 p-5"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><StarRating value={item.rating} size="sm" /><Badge>Аптека #{item.pharmacy}</Badge><span className="text-xs text-slate-400">Пользователь #{item.user}</span></div><p className="mt-3 text-sm text-slate-600">{item.text || "Без комментария"}</p></div><Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="size-4 text-red-600" /></Button></CardContent></Card>)}</div></>;
}

function ChatManager({ data, setData }) {
  async function unblock(id) {
    await api.delete(`chat-blocks/${id}/`);
    setData((current) => ({ ...current, chatBlocks: current.chatBlocks.filter((item) => item.id !== id) }));
  }
  return <div>
    <AdminHeading eyebrow="Коммуникации" title="Чаты и блокировки" description="Staff видит все диалоги и может снять активную блокировку. История сообщений сохраняется." actions={<Button asChild><Link to="/chats">Открыть messenger</Link></Button>} />
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <Card><CardContent className="divide-y divide-slate-100 p-0">{data.chats.map((item) => <div key={item.id} className="p-4"><div className="flex items-center justify-between gap-4"><b>Чат #{item.id}</b>{item.is_blocked && <Badge variant="danger">Заблокирован</Badge>}</div><p className="mt-1 text-sm text-slate-500">Пользователь #{item.user} · {data.pharmacies.find((pharmacy) => pharmacy.id === item.pharmacy)?.name || `Аптека #${item.pharmacy}`}</p></div>)}{!data.chats.length && <PageState type="empty" message="Чатов пока нет" compact />}</CardContent></Card>
      <Card><CardContent className="p-5"><h2 className="font-extrabold">Активные блокировки</h2><div className="mt-4 space-y-3">{data.chatBlocks.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-bold">Чат #{item.chat}</p><p className="mt-1 text-xs text-slate-500">{item.blocker_username} заблокировал {item.blocked_username}</p><Button size="sm" variant="secondary" className="mt-3" onClick={() => unblock(item.id)}>Разблокировать</Button></div>)}{!data.chatBlocks.length && <p className="text-sm text-slate-500">Активных блокировок нет.</p>}</div></CardContent></Card>
    </div>
  </div>;
}

function NotificationManager({ data, setData }) {
  const [form, setForm] = useState({ user: "", title: "", message: "" });
  async function send(event) { event.preventDefault(); const { data: created } = await api.post("notifications/", { ...form, user: Number(form.user) }); setData((current) => ({ ...current, notifications: [created, ...current.notifications] })); setForm({ user: "", title: "", message: "" }); }
  return <><AdminHeading eyebrow="Коммуникации" title="Уведомления" description="Системные сообщения создаются только staff." /><div className="grid gap-6 xl:grid-cols-[1fr_380px]"><SimpleList title="Отправленные уведомления" rows={data.notifications.map((item) => [item.id, item.title, item.message, `Пользователь #${item.user}`])} /><Card><CardContent className="p-6"><h2 className="font-extrabold">Новое уведомление</h2><form onSubmit={send} className="mt-5 space-y-3"><select className="focus-ring min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3" value={form.user} onChange={(event) => setForm({ ...form, user: event.target.value })} required><option value="">Получатель</option>{data.users.map((item) => <option key={item.id} value={item.id}>{item.username}</option>)}</select><Input placeholder="Заголовок" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /><textarea className="focus-ring w-full rounded-xl border border-slate-200 p-3 text-sm" rows="4" placeholder="Сообщение" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required /><Button type="submit" className="w-full">Отправить</Button></form></CardContent></Card></div></>;
}

function SimpleList({ title, description, rows, action }) { return <div><AdminHeading eyebrow="Данные" title={title} description={description} actions={action} /><Card><CardContent className="divide-y divide-slate-100 p-0">{rows.length ? rows.map(([id, titleText, detail, meta]) => <div key={id} className="p-4"><div className="flex justify-between gap-4"><b>{titleText}</b><span className="text-xs text-slate-400">{meta}</span></div><p className="mt-1 text-sm text-slate-500">{detail}</p></div>) : <PageState type="empty" message="Данных пока нет" compact />}</CardContent></Card></div>; }

function renderValue(section, key, value, data) {
  if (typeof value === "boolean") return value ? "Да" : "Нет";
  if (key === "pharmacy") return data.pharmacies.find((item) => item.id === value)?.name || `#${value}`;
  if (key === "medicine") return data.medicines.find((item) => item.id === value)?.name || `#${value}`;
  if (key === "price") return formatPrice(value);
  if (key.endsWith("_at") && value) return new Date(value).toLocaleString("ru-RU");
  return value || "—";
}
