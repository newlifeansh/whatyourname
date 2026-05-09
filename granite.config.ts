import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "whatyourname",
  brand: {
    displayName: "와츄어네임",
    primaryColor: "#3182F6",
    icon: "https://static.toss.im/appsintoss/35527/99b24185-1e44-4638-bf32-afd61ebb66c3.png",
  },
  web: {
    host: "0.0.0.0",
    port: 5174,
    commands: {
      dev: "vite dev --host 0.0.0.0 --port 5174",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
