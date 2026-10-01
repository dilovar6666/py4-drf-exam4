import { cn } from "../../lib/utils";

export default function Input({ className, ...props }) {
  return <input className={cn("focus-ring min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm shadow-slate-900/[0.02] placeholder:text-slate-400", className)} {...props} />;
}
