import { MonitorCog, MoonStar, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import useTheme from "../context/useTheme";

const nextMode = { light: "dark", dark: "system", system: "light" };

export default function ThemeSwitch() {
  const { mode, resolved, setMode } = useTheme();
  const { t } = useTranslation();
  const labels = { light: t("theme.light"), dark: t("theme.dark"), system: t("theme.system") };
  const Icon = mode === "system" ? MonitorCog : resolved === "dark" ? MoonStar : Sun;
  return <button type="button" onClick={() => setMode(nextMode[mode])} className={`theme-switch ${resolved === "dark" ? "is-dark" : ""}`} aria-label={labels[mode]} title={labels[mode]}><span className="theme-switch__sky"><Sun className="theme-switch__sun" /><MoonStar className="theme-switch__moon" /><span className="theme-switch__orb"><Icon /></span></span></button>;
}
