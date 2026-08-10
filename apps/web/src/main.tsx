import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@mantine/core/styles.css";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import App from "./App";
import { AuthProvider } from "./features/authentication/auth-context";

const theme = createTheme({
  fontFamily: "'Inter', sans-serif",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <ColorSchemeScript defaultColorScheme="light" />
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  </StrictMode>,
);
