import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminDashboard, { AdminHeading } from "../components/admin/AdminDashboard";
import AdminShell from "../components/admin/AdminShell";
import PageState from "../components/ui/PageState";

const emptyData = { pharmacies: [], workers: [], medicines: [], categories: [], inventory: [], reservations: [], reviews: [], chats: [], users: [], notifications: [], pharmacists: [] };

export default function AdminPanelPage() {
  const [section, setSection] = useState("dashboard");
  const [data, setData] = useState(emptyData);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    const endpoints = Object.entries({ pharmacies: "pharmacies/", workers: "pharmacy-workers/", medicines: "medicines/", categories: "categories/", inventory: "pharmacy-medicines/", reservations: "reservations/", reviews: "reviews/", chats: "chats/", users: "users/", notifications: "notifications/", pharmacists: "pharmacists/" });
    Promise.all(endpoints.map(([, endpoint]) => api.get(endpoint))).then((responses) => {
      if (!active) return;
      setData(Object.fromEntries(endpoints.map(([key], index) => [key, responses[index].data])));
      setStatus("ready");
    }).catch(() => active && setStatus("error"));
    return () => { active = false; };
  }, []);
  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить данные панели" />;
  return <AdminShell section={section} onSection={setSection}>{section === "dashboard" || section === "analytics" || section === "ratings" ? <AdminDashboard data={data} /> : <section><AdminHeading eyebrow="Управление" title={section} description="Раздел подключён к реальному PharmaMap API. CRUD-инструменты находятся в следующем представлении панели." /><PageState type="empty" message="Выберите действие в таблице управления" /></section>}</AdminShell>;
}
