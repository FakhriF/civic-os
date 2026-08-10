import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import App from "./App";
import { AuthProvider } from "./features/authentication/auth-context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  </StrictMode>
);
