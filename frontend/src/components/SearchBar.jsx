import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import useDebounce from "../hooks/useDebounce";
import { cn } from "../lib/utils";
import Button from "./ui/Button";

export default function SearchBar({ onSearch, onSelect, loading = false, initialValue = "", compact = false }) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [fetchedQuery, setFetchedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const containerRef = useRef(null);
  const debouncedQuery = useDebounce(query, 260);

  useEffect(() => {
    const value = debouncedQuery.trim();
    if (value.length < 2) {
      let active = true;
      window.queueMicrotask(() => {
        if (active) { setSuggestions([]); setFetchedQuery(""); setOpen(false); setActiveIndex(-1); }
      });
      return () => { active = false; };
    }
    let active = true;
    window.queueMicrotask(() => active && setSuggesting(true));
    api.get("medicines/search/", { params: { q: value } }).then(({ data }) => {
      if (active) { setSuggestions(data.slice(0, 8)); setFetchedQuery(value); setOpen(true); setActiveIndex(-1); }
    }).catch(() => active && setSuggestions([])).finally(() => active && setSuggesting(false));
    return () => { active = false; };
  }, [debouncedQuery]);

  useEffect(() => {
    function close(event) { if (!containerRef.current?.contains(event.target)) setOpen(false); }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function select(medicine) { setQuery(medicine.name); setOpen(false); setActiveIndex(-1); onSelect?.(medicine); }
  function submit(event) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    if (open && activeIndex >= 0 && suggestions[activeIndex]) { select(suggestions[activeIndex]); return; }
    onSearch?.(value, fetchedQuery === value ? suggestions : null);
    setOpen(false);
  }
  function handleKeyDown(event) {
    if (!open || !suggestions.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => (index + 1) % suggestions.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => index <= 0 ? suggestions.length - 1 : index - 1); }
    if (event.key === "Escape") { setOpen(false); setActiveIndex(-1); }
  }
  function clear() { setQuery(""); setSuggestions([]); setFetchedQuery(""); setOpen(false); setActiveIndex(-1); }

  return <div ref={containerRef} className="relative z-30"><form onSubmit={submit} className={cn("flex items-center rounded-[18px] border border-slate-200 bg-white p-1.5 shadow-[0_18px_55px_rgba(15,118,110,.12)] transition focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-100", compact ? "" : "sm:p-2")}><Search className="ml-3 size-5 shrink-0 text-teal-700" /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} onFocus={() => suggestions.length && setOpen(true)} placeholder="Лекарство, состав, производитель или штрихкод" aria-label="Поиск лекарства" aria-expanded={open} aria-autocomplete="list" className={cn("min-w-0 flex-1 bg-transparent px-3 text-slate-900 outline-none placeholder:text-slate-400", compact ? "h-10 text-sm" : "h-12 text-base sm:h-14 sm:text-lg")} />{(suggesting || loading) && <LoaderCircle className="mr-2 size-5 animate-spin text-teal-600" />}{query && !suggesting && <button type="button" onClick={clear} className="focus-ring mr-1 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Очистить поиск"><X className="size-4" /></button>}<Button type="submit" size={compact ? "md" : "lg"} className={cn("shrink-0", !compact && "hidden sm:inline-flex")}>Найти</Button></form><AnimatePresence>{open && query.trim().length >= 2 && <motion.div role="listbox" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute inset-x-0 top-[calc(100%+.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">{suggestions.length ? suggestions.map((medicine, index) => <button key={medicine.id} role="option" aria-selected={index === activeIndex} type="button" onMouseEnter={() => setActiveIndex(index)} onClick={() => select(medicine)} className={cn("flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition", index === activeIndex ? "bg-teal-50" : "hover:bg-teal-50")}><span><span className="block font-semibold text-slate-900">{medicine.name}</span><span className="mt-0.5 block text-xs text-slate-500">{[medicine.dosage, medicine.form, medicine.active_ingredient, medicine.manufacturer].filter(Boolean).join(" · ")}</span></span><span className="text-xs font-semibold text-teal-700">Выбрать</span></button>) : !suggesting && <p className="px-4 py-5 text-center text-sm text-slate-500">Совпадений не найдено</p>}</motion.div>}</AnimatePresence></div>;
}
