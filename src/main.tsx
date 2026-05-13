import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import config from "../granite.config.ts";
import App from "./App.tsx";
import "./index.css";

declare global {
  interface Window {
    NativeWindow2?: {
      getSafeAreaInsets: () => {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
    };
  }
}

// 브라우저 개발 환경에서 SafeAreaInsets 에러 방지 폴리필
if (typeof window !== "undefined" && !window.NativeWindow2) {
  window.NativeWindow2 = {
    getSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
}
if (typeof window !== "undefined") {
  document.documentElement.style.setProperty("--toss-safe-area-bottom", "0px");
  document.documentElement.style.setProperty("--toss-safe-area-top", "0px");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TDSMobileAITProvider brandPrimaryColor={config.brand.primaryColor}>
      <App />
    </TDSMobileAITProvider>
  </StrictMode>,
);
