import { ArrowLeft, Building2, CheckCheck, MessageCircle, Send, ShieldOff, ShieldCheck, UserRound, Wifi } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api, { apiErrorMessage, mediaUrl } from "../api/axios";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import PageState from "../components/ui/PageState";
import useAuth from "../context/useAuth";
import useAuthenticatedSocket from "../hooks/useAuthenticatedSocket";

function presenceLabel(presence) {
  if (!presence) return "Аптека отвечает в этом диалоге";
  if (presence.is_online) return "В сети";
  if (!presence.last_seen) return "Был(а) недавно";
  const date = new Date(presence.last_seen);
  const now = new Date();
  if (now - date < 10 * 60 * 1000) return "Был(а) недавно";
  return `Был(а) в ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function ChatsPage() {
  const { user } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState([]); const [pharmacies, setPharmacies] = useState({});
  const [activeId, setActiveId] = useState(null); const [messages, setMessages] = useState([]);
  const [blocks, setBlocks] = useState([]); const [status, setStatus] = useState("loading");
  const [text, setText] = useState(""); const [sendState, setSendState] = useState({});

  useEffect(() => { let mounted = true; (async () => { try {
    const [{ data: chatData }, { data: pharmacyData }] = await Promise.all([api.get("chats/"), api.get("pharmacies/")]);
    if (!mounted) return; let nextChats = chatData; let requested = Number(chatId || searchParams.get("chat"));
    const pharmacyId = Number(searchParams.get("pharmacy") || sessionStorage.getItem("chat_pharmacy_id"));
    if (!requested && pharmacyId && user.role !== "pharmacist") { let chat = nextChats.find((item) => item.pharmacy === pharmacyId); if (!chat) { chat = (await api.post("chats/", { pharmacy: pharmacyId })).data; nextChats = [chat, ...nextChats]; } requested = chat.id; sessionStorage.removeItem("chat_pharmacy_id"); navigate(`/messages/${chat.id}`, { replace: true }); }
    if (!mounted) return; setChats(nextChats); setPharmacies(Object.fromEntries(pharmacyData.map((item) => [item.id, item]))); setActiveId(requested || nextChats[0]?.id || null); setStatus("ready");
  } catch { if (mounted) setStatus("error"); } })(); return () => { mounted = false; }; }, [chatId, navigate, searchParams, user.role]);

  const loadMessages = useCallback(async (id) => id ? api.get(`chats/${id}/messages/`).then(({ data }) => data) : [], []);
  const loadBlocks = useCallback(async (id) => id ? api.get("chat-blocks/", { params: { chat: id } }).then(({ data }) => data) : [], []);
  useEffect(() => {
    if (!activeId) return undefined;
    let current = true;
    Promise.all([loadMessages(activeId), loadBlocks(activeId)])
      .then(([nextMessages, nextBlocks]) => {
        if (!current) return;
        setMessages(nextMessages);
        setBlocks(nextBlocks);
      })
      .catch(() => current && setSendState({ error: "Не удалось загрузить диалог." }));
    return () => { current = false; };
  }, [activeId, loadBlocks, loadMessages]);
  const { status: socketStatus } = useAuthenticatedSocket(activeId ? `/ws/chats/${activeId}/` : null, (event) => {
    if (event.type === "message") setMessages((items) => items.some((item) => item.id === event.message.id) ? items : [...items, event.message]);
    if (event.type === "block") { setChats((items) => items.map((item) => item.id === activeId ? { ...item, is_blocked: event.blocked } : item)); loadBlocks(activeId).then(setBlocks).catch(() => {}); }
    if (event.type === "error") setSendState({ error: event.message });
  }, Boolean(activeId));
  const activeChat = chats.find((chat) => chat.id === activeId); const activePharmacy = activeChat ? pharmacies[activeChat.pharmacy] : null;
  const title = user.role === "pharmacist" && activeChat ? activeChat.counterpart_username || `Клиент #${activeChat.user}` : activePharmacy?.name || "Аптека";
  const myBlock = blocks.find((block) => block.blocker === user.id); const isBlocked = Boolean(activeChat?.is_blocked || blocks.length);
  const lastMessages = useMemo(() => Object.fromEntries(chats.map((chat) => [chat.id, chat.id === activeId ? messages.at(-1) : null])), [activeId, chats, messages]);
  async function send(event) { event.preventDefault(); const value = text.trim(); if (!value || !activeId || isBlocked) return; setText(""); setSendState({ loading: true }); try { const { data } = await api.post("messages/", { chat: activeId, text: value }); setMessages((items) => items.some((item) => item.id === data.id) ? items : [...items, data]); setSendState({}); } catch (error) { setText(value); setSendState({ error: apiErrorMessage(error, "Сообщение не отправлено.") }); } }
  async function toggleBlock() { try { if (myBlock) await api.delete(`chat-blocks/${myBlock.id}/`); else await api.post("chat-blocks/", { chat: activeChat.id, blocked: activeChat.counterpart_id }); setBlocks(await loadBlocks(activeChat.id)); } catch (error) { setSendState({ error: apiErrorMessage(error, "Не удалось изменить блокировку.") }); } }
  if (status === "loading") return <PageState type="loading" />; if (status === "error") return <PageState type="error" message="Не удалось загрузить сообщения" />;
  const statusText = activeChat ? presenceLabel(activeChat.counterpart_presence) : "";
  return <div className="page-shell py-8 pb-28 sm:py-12"><PageHeader eyebrow={user.role === "pharmacist" ? "Рабочее место аптеки" : "Связь с аптекой"} title="Сообщения" description="История хранится в сервисе, а новые сообщения приходят мгновенно." /><Card className="chat-shell grid min-h-[650px] overflow-hidden lg:grid-cols-[340px_1fr]"><aside className={`${activeId ? "hidden lg:block" : "block"} chat-list-panel border-b border-slate-200 lg:border-b-0 lg:border-r`}><div className="border-b border-slate-200 p-5"><b className="text-sm">Диалоги</b><p className="mt-1 flex gap-1 text-xs text-teal-700"><Wifi className="size-3" />Защищённые сообщения</p></div><div className="max-h-[590px] overflow-y-auto p-2">{chats.length ? chats.map((chat) => { const pharmacy = pharmacies[chat.pharmacy]; const label = user.role === "pharmacist" ? chat.counterpart_username || `Клиент #${chat.user}` : pharmacy?.name || "Аптека"; return <button key={chat.id} onClick={() => setActiveId(chat.id)} className={`chat-list-item flex w-full gap-3 rounded-2xl p-3 text-left ${chat.id === activeId ? "is-selected" : ""}`}><Avatar src={chat.counterpart_avatar ? mediaUrl(chat.counterpart_avatar) : undefined} fallback={label.slice(0, 1)} className="size-10" /><span className="min-w-0"><b className="block truncate text-sm">{label}</b><span className="mt-1 block truncate text-xs text-slate-500">{lastMessages[chat.id]?.text || pharmacy?.name || "Открыть диалог"}</span></span></button>; }) : <PageState type="empty" message="Диалогов пока нет" compact />}</div></aside><section className={`${activeId ? "flex" : "hidden lg:flex"} min-h-[500px] flex-col`}>{activeChat ? <><header className="chat-header flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-5"><button className="rounded-xl p-2 lg:hidden" onClick={() => setActiveId(null)}><ArrowLeft className="size-5" /></button><Avatar src={activeChat.counterpart_avatar ? mediaUrl(activeChat.counterpart_avatar) : undefined} fallback={title.slice(0, 1)} className="size-10" /><div className="min-w-0 flex-1"><h2 className="truncate font-extrabold">{title}</h2><p className={`text-xs ${activeChat.counterpart_presence?.is_online ? "text-emerald-700" : "text-slate-500"}`}>{statusText}</p></div>{(!isBlocked || myBlock) && <Button type="button" variant="ghost" size="sm" onClick={toggleBlock} disabled={!myBlock && !activeChat.counterpart_id}>{myBlock ? <><ShieldCheck className="size-4" />Разблокировать</> : <><ShieldOff className="size-4" />Заблокировать</>}</Button>}</header><div className="chat-message-canvas flex-1 space-y-3 overflow-y-auto p-5">{messages.length ? messages.map((message) => <MessageBubble key={message.id} message={message} mine={message.sender === user.id} />) : <PageState type="empty" message="Начните разговор" compact />}</div><form onSubmit={send} className="chat-composer border-t border-slate-200 p-4">{isBlocked && <p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">{myBlock ? "Вы заблокировали пользователя. История остаётся доступной." : "Вы заблокированы. Отправка сообщений недоступна."}</p>}<div className="flex items-end gap-2"><textarea value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(event); } }} rows="1" disabled={isBlocked} placeholder={isBlocked ? "Отправка сообщений недоступна" : "Напишите сообщение..."} className="focus-ring min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-100" /><Button type="submit" size="icon" className="size-11 rounded-2xl" disabled={!text.trim() || sendState.loading || isBlocked || socketStatus !== "open"}><Send className="size-4" /></Button></div>{sendState.error && <p className="mt-2 text-xs text-red-600">{sendState.error}</p>}</form></> : <div className="grid flex-1 place-items-center"><PageState icon={MessageCircle} type="empty" message="Выберите диалог" /></div>}</section></Card></div>;
}
function MessageBubble({ message, mine }) { return <div className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${mine ? "rounded-br-md bg-teal-700 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700"}`}><p>{message.text}</p><span className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-teal-100" : "text-slate-400"}`}>{new Date(message.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}{mine && <CheckCheck className="size-3" />}</span></div></div>; }
