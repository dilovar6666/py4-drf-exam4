import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import "leaflet/dist/leaflet.css";
import "./index.css";
import App from "./App";
import ThemeProvider from "./context/ThemeContext";
import i18n from "./i18n";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}><ThemeProvider><BrowserRouter><App /></BrowserRouter></ThemeProvider></I18nextProvider>
  </StrictMode>,
);
