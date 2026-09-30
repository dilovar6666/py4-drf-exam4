import { Search } from "lucide-react";
import { useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function SearchBar({ onSearch, loading = false, initialValue = "" }) {
  const [query, setQuery] = useState(initialValue);
  function submit(event) { event.preventDefault(); const value = query.trim(); if (value) onSearch(value); }
  return <form onSubmit={submit} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-emerald-950/10 sm:flex-row"><label className="relative flex-1"><span className="sr-only">Название лекарства</span><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например, Парацетамол" className="h-12 border-0 pl-12 text-base shadow-none" /></label><Button type="submit" className="h-12 px-7" disabled={!query.trim() || loading}>{loading ? "Ищем..." : "Найти"}</Button></form>;
}
