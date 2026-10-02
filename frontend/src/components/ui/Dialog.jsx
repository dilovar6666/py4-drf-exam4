import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children }) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-[2000] bg-slate-950/35 backdrop-blur-sm data-[state=open]:animate-in" /><DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-[2001] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl outline-none max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] max-sm:w-full max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[1.5rem] max-sm:p-5", className)}>{children}<DialogPrimitive.Close className="focus-ring absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="size-4" /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}

export const DialogTitle = ({ className, ...props }) => <DialogPrimitive.Title className={cn("text-xl font-extrabold tracking-tight text-slate-950", className)} {...props} />;
export const DialogDescription = ({ className, ...props }) => <DialogPrimitive.Description className={cn("mt-2 text-sm leading-6 text-slate-500", className)} {...props} />;
