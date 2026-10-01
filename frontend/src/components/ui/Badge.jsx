import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-slate-100 text-slate-700",
      success: "bg-emerald-50 text-emerald-700",
      teal: "bg-teal-50 text-teal-800",
      blue: "bg-blue-50 text-blue-700",
      warning: "bg-amber-50 text-amber-700",
      danger: "bg-red-50 text-red-700",
    },
  },
  defaultVariants: { variant: "default" },
});

export default function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
