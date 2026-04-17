import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "whatyourname",
  brand: {
    displayName: "와츄어네임",
    primaryColor: "#3182F6",
    icon: "",
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
