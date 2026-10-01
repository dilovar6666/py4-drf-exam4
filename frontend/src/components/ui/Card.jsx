import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_12px_36px_rgba(15,118,110,0.06)]", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}
