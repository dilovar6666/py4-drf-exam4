import { useEffect, useMemo, useState } from "react";
import ThemeContext from "./theme-context";
const STORAGE_KEY = "pharmamap-theme";

function resolveTheme(mode) {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");
  const [resolved, setResolved] = useState(() => resolveTheme(mode));

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const value = resolveTheme(mode);
      setResolved(value);
      document.documentElement.classList.toggle("dark", value === "dark");
      document.documentElement.dataset.theme = value;
      document.documentElement.style.colorScheme = value;
    };
    apply();
    media.addEventListener("change", apply);
    localStorage.setItem(STORAGE_KEY, mode);
    return () => media.removeEventListener("change", apply);
  }, [mode]);

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
