const variants = {
  primary: "bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm",
  secondary: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export default function Button({ className = "", variant = "primary", type = "button", ...props }) {
  return <button type={type} className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`} {...props} />;
}
