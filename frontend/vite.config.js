import { defineConfig, loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const frontendEnv = loadEnv(mode, frontendRoot, "VITE_");
  const rootEnv = loadEnv(mode, projectRoot, "VITE_");
  const mapTilerKey = frontendEnv.VITE_MAPTILER_KEY || rootEnv.VITE_MAPTILER_KEY || "";
  return {
    plugins: [react(), tailwindcss()],
    envDir: projectRoot,
    define: {
      // Prefer frontend/.env; retain root .env compatibility for the local Django setup.
      "import.meta.env.VITE_MAPTILER_KEY": JSON.stringify(mapTilerKey),
    },
    server: { host: "0.0.0.0" },
  };
});
