import "./i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

if (
  window.location.protocol !== "https:" &&
  window.location.host.indexOf("localhost") === -1
) {
  window.location.protocol = "https";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
