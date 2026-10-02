import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminManagement from "../components/admin/AdminManagement";
import AdminShell from "../components/admin/AdminShell";
import PageState from "../components/ui/PageState";

const endpoints = {
  pharmacies: "pharmacies/", applications: "pharmacy-applications/", workers: "pharmacy-workers/",
  medicines: "medicines/", categories: "categories/", inventory: "pharmacy-medicines/",
  reservations: "reservations/", reviews: "reviews/", pharmacistReviews: "pharmacist-reviews/",
  chats: "chats/", chatBlocks: "chat-blocks/", users: "users/", notifications: "notifications/",
  pharmacists: "pharmacists/",
};
const emptyData = Object.fromEntries(Object.keys(endpoints).map((key) => [key, []]));

export default function AdminPanelPage() {
  const [section, setSection] = useState("dashboard");
  const [data, setData] = useState(emptyData);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    const entries = Object.entries(endpoints);
    Promise.all(entries.map(([, endpoint]) => api.get(endpoint))).then((responses) => {
      if (!active) return;
      setData(Object.fromEntries(entries.map(([key], index) => [key, responses[index].data])));
      setStatus("ready");
    }).catch(() => active && setStatus("error"));
    return () => { active = false; };
  }, []);
  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить данные панели" />;
  return <AdminShell section={section} onSection={setSection}>
    {section === "dashboard" && <AdminDashboard data={data} onNavigate={setSection} />}
    {section === "analytics" && <AdminAnalytics data={data} />}
    {section !== "dashboard" && section !== "analytics" && <AdminManagement section={section} data={data} setData={setData} />}
  </AdminShell>;
}
