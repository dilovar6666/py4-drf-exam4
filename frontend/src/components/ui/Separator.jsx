import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../../lib/utils";

export default function Separator({ className, orientation = "horizontal" }) {
  return <SeparatorPrimitive.Root orientation={orientation} className={cn("shrink-0 bg-slate-200", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)} />;
}
