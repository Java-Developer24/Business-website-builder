import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import apiRoutes from "vite-plugin-api-routes";

const allowedHosts: string[] = [];

if (process.env.FRONTEND_DOMAIN) {
  allowedHosts.push(
    process.env.FRONTEND_DOMAIN,
    `http://${process.env.FRONTEND_DOMAIN}`,
    `https://${process.env.FRONTEND_DOMAIN}`
  );
}

if (process.env.ALLOWED_ORIGINS) {
  allowedHosts.push(...process.env.ALLOWED_ORIGINS.split(","));
}

if (process.env.VITE_PARENT_ORIGIN) {
  allowedHosts.push(process.env.VITE_PARENT_ORIGIN);
}

if (allowedHosts.length === 0) {
  allowedHosts.push("*");
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(), // ✅ keep React plugin clean

    apiRoutes({
      mode: "isolated",
      configure: "src/server/configure.js",
      dirs: [{ dir: "./src/server/api", route: "" }],
      forceRestart: mode === "development",
    }),
  ],

  resolve: {
    alias: {
      nothing: "/src/fallbacks/missingModule.ts",
      "@": path.resolve(__dirname, "./src"),
      "@/api": path.resolve(__dirname, "./src/server/api"),
    },
  },

  server: {
    host: process.env.HOST || "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
    strictPort: !!process.env.PORT,
    allowedHosts,
    cors: {
      origin: allowedHosts,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept", "User-Agent"],
    },
    hmr: {
      overlay: false,
    },
    watch: {
      ignored: ["**/dist/**", "**/.api/**"],
    },
  },

  build: {
    rollupOptions: {
      // bundle everything
    },
  },
}));
