import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "@/context/AuthContext";
import { ClickSpark } from "@/components/effects/ClickSpark";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClickSpark
      sparkColor="rgba(15, 15, 16, 0.45)"
      sparkSize={5}
      sparkCount={10}
      sparkRadius={18}
      duration={280}
      easing="ease-out"
      extraScale={1}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ClickSpark>
  </StrictMode>
);