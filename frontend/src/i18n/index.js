import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "./locales/ru.json";
import tj from "./locales/tj.json";
import en from "./locales/en.json";

const STORAGE_KEY = "pharmamap-language";
const saved = localStorage.getItem(STORAGE_KEY);

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, tj: { translation: tj }, en: { translation: en } },
  ns: ["translation"],
  defaultNS: "translation",
  lng: ["ru", "tj", "en"].includes(saved) ? saved : "ru",
  fallbackLng: "ru",
  returnNull: false,
  returnEmptyString: false,
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (language) => localStorage.setItem(STORAGE_KEY, language));
export default i18n;
