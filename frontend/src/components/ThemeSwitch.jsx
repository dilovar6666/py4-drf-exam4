import { MonitorCog, MoonStar, Sun } from "lucide-react";
import useTheme from "../context/useTheme";

const nextMode = { light: "dark", dark: "system", system: "light" };
const labels = { light: "Светлая тема", dark: "Тёмная тема", system: "Системная тема" };

export default function ThemeSwitch() {
  const { mode, resolved, setMode } = useTheme();
  const Icon = mode === "system" ? MonitorCog : resolved === "dark" ? MoonStar : Sun;
  return <button type="button" onClick={() => setMode(nextMode[mode])} className={`theme-switch ${resolved === "dark" ? "is-dark" : ""}`} aria-label={`${labels[mode]}. Нажмите, чтобы сменить режим`} title={labels[mode]}><span className="theme-switch__sky"><Sun className="theme-switch__sun" /><MoonStar className="theme-switch__moon" /><span className="theme-switch__orb"><Icon /></span></span></button>;
}
