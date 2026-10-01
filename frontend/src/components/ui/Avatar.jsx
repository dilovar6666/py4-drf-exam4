import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../lib/utils";

export default function Avatar({ src, alt, fallback, className }) {
  return <AvatarPrimitive.Root className={cn("inline-grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-teal-100 font-bold text-teal-800", className)}><AvatarPrimitive.Image src={src} alt={alt} className="size-full object-cover" /><AvatarPrimitive.Fallback>{fallback}</AvatarPrimitive.Fallback></AvatarPrimitive.Root>;
}
