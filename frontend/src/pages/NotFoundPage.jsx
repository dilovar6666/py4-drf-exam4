import { Link } from "react-router-dom";

export default function NotFoundPage() { return <div className="page-shell grid min-h-[70vh] place-items-center text-center"><div><p className="text-sm font-semibold text-emerald-700">404</p><h1 className="mt-2 text-3xl font-bold">Страница не найдена</h1><p className="mt-3 text-slate-500">Возможно, адрес был изменён.</p><Link to="/" className="focus-ring mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white">На главную</Link></div></div>; }
