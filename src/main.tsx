import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import "./Styles/index.css";
import "./Styles/custom.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 8000,
        style: {
          maxWidth: "min(92vw, 36rem)",
          width: "max-content",
          padding: "12px 16px",
          fontSize: "0.875rem",
          lineHeight: "1.4",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          whiteSpace: "pre-wrap",
        },
        error: {
          duration: 12000,
        },
      }}
    />
    <Analytics />
  </StrictMode>
);
