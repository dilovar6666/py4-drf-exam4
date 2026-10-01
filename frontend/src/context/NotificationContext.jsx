import { Bell, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import useAuthenticatedSocket from "../hooks/useAuthenticatedSocket";
import useAuth from "./useAuth";
import { NotificationContext } from "./notification-context";

export default function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const refresh = useCallback(async () => {
    if (!user) { setNotifications([]); return; }
    const { data } = await api.get("notifications/");
    setNotifications(data);
  }, [user]);
  useEffect(() => {
    const timer = window.setTimeout(() => refresh().catch(() => {}), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);
  useAuthenticatedSocket("/ws/notifications/", (event) => {
    if (event.type !== "notification") return;
    const item = event.notification;
    window.dispatchEvent(new CustomEvent("notification:received", { detail: item }));
    setNotifications((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
    setToasts((current) => [...current, item]);
    window.setTimeout(() => setToasts((current) => current.filter((entry) => entry.id !== item.id)), 5000);
  }, Boolean(user));
  const markRead = useCallback(async (item) => {
    if (item.is_read) return;
    await api.patch(`notifications/${item.id}/`, { is_read: true });
    setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: true } : entry));
  }, []);
  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((item) => !item.is_read);
    await Promise.all(unread.map((item) => api.patch(`notifications/${item.id}/`, { is_read: true })));
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
  }, [notifications]);
  const value = useMemo(() => ({ notifications, unreadCount: notifications.filter((item) => !item.is_read).length, markRead, markAllRead, refresh }), [notifications, markRead, markAllRead, refresh]);
  return <NotificationContext.Provider value={value}>{children}<div className="fixed right-4 top-20 z-[1000] grid w-[min(360px,calc(100vw-2rem))] gap-2">{toasts.map((toast) => <div key={toast.id} className="flex gap-3 rounded-2xl border border-teal-200 bg-white p-4 shadow-2xl shadow-slate-950/15"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Bell className="size-4" /></span><div className="min-w-0 flex-1"><b className="text-sm text-slate-950">{toast.title}</b><p className="mt-1 text-xs leading-5 text-slate-500">{toast.message}</p></div><button onClick={() => setToasts((current) => current.filter((entry) => entry.id !== toast.id))} className="self-start text-slate-400"><X className="size-4" /></button></div>)}</div></NotificationContext.Provider>;
}
