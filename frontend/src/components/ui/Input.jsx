export default function Input({ className = "", ...props }) {
  return <input className={`focus-ring min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 ${className}`} {...props} />;
}
