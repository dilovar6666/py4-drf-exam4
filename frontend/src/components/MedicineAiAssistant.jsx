import { Bot, Send, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { apiErrorMessage } from "../api/axios";
import useAuth from "../context/useAuth";
import Button from "./ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/Dialog";

export default function MedicineAiAssistant() {
  const { id } = useParams();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [medicine, setMedicine] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState({ loading: false, error: "" });

  useEffect(() => {
    api.get(`medicines/${id}/`).then(({ data }) => setMedicine(data)).catch(() => {});
  }, [id]);

  async function ask(event) {
    event.preventDefault();
    const text = question.trim();
    if (!text || state.loading) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setQuestion(""); setState({ loading: true, error: "" });
    try {
      const { data } = await api.post(`ai/medicines/${id}/ask/`, { question: text });
      setMessages((current) => [...current, { role: "assistant", text: data.answer }]);
      setState({ loading: false, error: "" });
    } catch (error) {
      setState({ loading: false, error: apiErrorMessage(error, "AI-помощник временно недоступен.") });
    }
  }

  return <>
    <Button type="button" onClick={() => setOpen(true)} className="fixed bottom-24 right-4 z-[700] rounded-2xl shadow-xl sm:bottom-6 sm:right-6"><Sparkles className="size-4" />Спросить Pharma AI</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="flex max-h-[82dvh] max-w-2xl flex-col overflow-hidden p-0 max-sm:h-[100dvh] max-sm:max-h-none max-sm:rounded-none">
      <header className="border-b border-slate-200 p-6 pr-14"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Bot className="size-5" /></span><div><DialogTitle>Pharma AI</DialogTitle><DialogDescription className="mt-0">Справка о {medicine?.name || "препарате"}</DialogDescription></div></div></header>
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
        {!messages.length && <div className="rounded-2xl border border-teal-100 bg-white p-5"><p className="font-bold text-slate-900">Что можно спросить?</p><p className="mt-2 text-sm leading-6 text-slate-600">О действующем веществе, форме выпуска, производителе и общей справочной информации из карточки препарата.</p></div>}
        {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-teal-700 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700"}`}>{message.text}</div></div>)}
        {state.loading && <div className="w-fit rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Формирую справочный ответ…</div>}
      </div>
      <div className="border-t border-slate-200 bg-white p-4"><p className="mb-3 flex items-start gap-2 text-[11px] leading-5 text-slate-500"><ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" />AI не ставит диагноз и не подбирает лечение или персональную дозировку. Для медицинского решения обратитесь к врачу или фармацевту.</p>{user ? <form onSubmit={ask} className="flex gap-2"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows="2" maxLength="1000" placeholder="Задайте справочный вопрос…" className="focus-ring min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm" /><Button type="submit" size="icon" className="size-12 rounded-2xl" disabled={!question.trim() || state.loading}><Send className="size-4" /></Button></form> : <Button asChild className="w-full"><Link to="/login">Войти, чтобы задать вопрос</Link></Button>}{state.error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{state.error}</p>}</div>
    </DialogContent></Dialog>
  </>;
}
