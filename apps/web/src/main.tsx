import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@mantine/core/styles.css";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import App from "./App";
import { AuthProvider } from "./features/authentication/auth-context";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/error-boundary";

const theme = createTheme({
  fontFamily: "'Inter', sans-serif",
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err) => {
      if (import.meta.env.DEV) console.error("[query]", err)
    }
  }),
  mutationCache: new MutationCache({
    onError: (err) => { if (import.meta.env.DEV) console.error("[mutation", err) }
  })
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <ColorSchemeScript defaultColorScheme="light" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
);
