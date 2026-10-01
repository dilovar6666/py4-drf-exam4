import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-teal-700 text-white shadow-sm shadow-teal-900/10 hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md",
        secondary: "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-teal-200 hover:bg-teal-50/60",
        ghost: "text-slate-600 hover:bg-teal-50 hover:text-teal-800",
        danger: "bg-red-600 text-white hover:bg-red-700",
        soft: "bg-teal-50 text-teal-800 hover:bg-teal-100",
      },
      size: {
        sm: "min-h-9 rounded-lg px-3 text-xs",
        md: "min-h-10 px-4",
        lg: "min-h-12 rounded-2xl px-6 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export default function Button({ className, variant, size, asChild = false, type = "button", ...props }) {
  const Component = asChild ? Slot : "button";
  return <Component type={asChild ? undefined : type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
