import { ArrowLeft, Building2, CheckCheck, MessageCircle, Send, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { apiErrorMessage } from "../api/axios";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import PageState from "../components/ui/PageState";
import useAuth from "../context/useAuth";

export default function ChatsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState([]);
  const [pharmacies, setPharmacies] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("loading");
  const [text, setText] = useState("");
  const [sendState, setSendState] = useState({});

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [{ data: chatData }, { data: pharmacyData }] = await Promise.all([api.get("chats/"), api.get("pharmacies/")]);
        if (!active) return;
        let nextChats = chatData;
        let requestedChat = Number(searchParams.get("chat"));
        const requestedPharmacy = Number(searchParams.get("pharmacy") || sessionStorage.getItem("chat_pharmacy_id"));
        if (!requestedChat && requestedPharmacy && user.role !== "pharmacist") {
          let chat = nextChats.find((item) => item.pharmacy === requestedPharmacy);
          if (!chat) {
            const response = await api.post("chats/", { pharmacy: requestedPharmacy });
            chat = response.data;
            nextChats = [chat, ...nextChats];
          }
          requestedChat = chat.id;
          sessionStorage.removeItem("chat_pharmacy_id");
        }
        if (!active) return;
        setChats(nextChats);
        setPharmacies(Object.fromEntries(pharmacyData.map((item) => [item.id, item])));
        setActiveId(requestedChat || nextChats[0]?.id || null);
        setStatus("ready");
      } catch { if (active) setStatus("error"); }
    }
    load();
    return () => { active = false; };
  }, [searchParams, user.role]);

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    try { const { data } = await api.get(`chats/${chatId}/messages/`); setMessages(data); }
    catch { /* polling keeps the last visible conversation */ }
  }, []);
  useEffect(() => {
    if (!activeId) return undefined;
    const initial = window.setTimeout(() => loadMessages(activeId), 0);
    const timer = window.setInterval(() => loadMessages(activeId), 10000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [activeId, loadMessages]);

  const activeChat = chats.find((chat) => chat.id === activeId);
  const activePharmacy = activeChat ? pharmacies[activeChat.pharmacy] : null;
  const title = user.role === "pharmacist" && activeChat ? `Клиент #${activeChat.user}` : activePharmacy?.name || "Аптека";
  const lastMessages = useMemo(() => Object.fromEntries(chats.map((chat) => [chat.id, chat.id === activeId ? messages.at(-1) : null])), [chats, activeId, messages]);

  async function send(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value || !activeId) return;
    setSendState({ loading: true });
    try {
      const { data } = await api.post("messages/", { chat: activeId, text: value });
      setMessages((items) => [...items, data]); setText(""); setSendState({});
    } catch (error) { setSendState({ error: apiErrorMessage(error, "Не удалось отправить сообщение.") }); }
  }

  if (status === "loading") return <PageState type="loading" />;
  if (status === "error") return <PageState type="error" message="Не удалось загрузить сообщения" />;
  return <div className="page-shell py-8 pb-28 sm:py-12"><PageHeader eyebrow={user.role === "pharmacist" ? "Рабочее место аптеки" : "Связь с аптекой"} title="Сообщения" description="REST-диалоги об актуальном наличии и готовности брони." /><Card className="grid min-h-[650px] overflow-hidden lg:grid-cols-[340px_1fr]">
    <aside className={`${activeId ? "hidden lg:block" : "block"} border-b border-slate-200 bg-slate-50/60 lg:border-b-0 lg:border-r`}><div className="border-b border-slate-200 p-5"><p className="text-sm font-extrabold text-slate-900">Диалоги</p><p className="mt-1 text-xs text-slate-500">Обновление каждые 10 секунд</p></div><div className="max-h-[590px] overflow-y-auto p-2">{chats.length ? chats.map((chat) => { const pharmacy = pharmacies[chat.pharmacy]; const last = lastMessages[chat.id]; const chatTitle = user.role === "pharmacist" ? `Клиент #${chat.user}` : pharmacy?.name || "Аптека"; return <button key={chat.id} onClick={() => setActiveId(chat.id)} className={`flex w-full gap-3 rounded-2xl p-3 text-left transition ${chat.id === activeId ? "bg-white shadow-sm ring-1 ring-teal-100" : "hover:bg-white"}`}><Avatar fallback={chatTitle.slice(0, 1)} className="size-10" /><span className="min-w-0"><b className="block truncate text-sm text-slate-900">{chatTitle}</b><span className="mt-1 block truncate text-xs text-slate-500">{last?.text || pharmacy?.name || "Открыть диалог"}</span></span></button>; }) : <PageState type="empty" message="Диалогов пока нет" compact />}</div></aside>
    <section className={`${activeId ? "flex" : "hidden lg:flex"} min-h-[500px] flex-col`}>{activeChat ? <><header className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-5"><button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setActiveId(null)} aria-label="К списку чатов"><ArrowLeft className="size-5" /></button><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">{user.role === "pharmacist" ? <UserRound className="size-5" /> : <Building2 className="size-5" />}</span><div><h2 className="font-extrabold text-slate-950">{title}</h2><p className="text-xs text-emerald-700">{activePharmacy?.name} · сообщения обновляются автоматически</p></div></header><div className="flex-1 space-y-3 overflow-y-auto bg-[#f8faf9] p-5">{messages.length ? messages.map((message) => { const mine = message.sender === user.id; return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${mine ? "rounded-br-md bg-teal-700 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700"}`}><p>{message.text}</p><span className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-teal-100" : "text-slate-400"}`}>{new Date(message.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}{mine && <CheckCheck className="size-3" />}</span></div></div>; }) : <PageState type="empty" message="Начните разговор" compact />}</div><form onSubmit={send} className="border-t border-slate-200 bg-white p-4"><div className="flex items-end gap-2"><textarea value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(event); } }} rows="1" placeholder="Напишите сообщение..." className="focus-ring min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm" /><Button type="submit" size="icon" className="size-11 rounded-2xl" disabled={!text.trim() || sendState.loading}><Send className="size-4" /></Button></div>{sendState.error && <p className="mt-2 text-xs text-red-600">{sendState.error}</p>}</form></> : <div className="grid flex-1 place-items-center"><PageState icon={MessageCircle} type="empty" message="Выберите диалог" /></div>}</section>
  </Card></div>;
}
