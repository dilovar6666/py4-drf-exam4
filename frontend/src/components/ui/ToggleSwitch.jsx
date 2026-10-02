import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

export default function ToggleSwitch({ checked, onChange, label, disabled, variant = "default", name }) {
  return <label className={cn("toggle-control", variant === "admin" && "is-admin", disabled && "is-disabled")}><input name={name} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} disabled={disabled} /><span className="toggle-control__track" aria-hidden="true"><span className="toggle-control__thumb"><Check /></span></span>{label && <span className="toggle-control__label">{label}</span>}</label>;
}
