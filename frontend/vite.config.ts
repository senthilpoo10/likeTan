import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load .env files
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // Allows all hosts
      port: 5173,
      allowedHosts: true,
      proxy: {
        "/app": {
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/app/, ""),
          target: env.VITE_API_URL || "http://localhost:8080",
        },
      },
    },
  };
});
