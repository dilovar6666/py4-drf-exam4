import Input from "./ui/Input";

export default function FormField({ label, id, error, ...props }) {
  return <label className="block" htmlFor={id}><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span><Input id={id} name={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={error ? "border-red-400" : ""} {...props} />{error && <span id={`${id}-error`} className="mt-1.5 block text-xs text-red-600">{error}</span>}</label>;
}
