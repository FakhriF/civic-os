import { Center, Loader, Stack, Text } from "@mantine/core";
import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "./auth-context";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Guard component that protects private pages (e.g. /dashboard or /citizens)
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Show a loading spinner while the session is being checked against the backend (/refresh)
  if (isLoading) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="sm">
          <Loader size="lg" type="dots" color="blue" />
          <Text size="sm" c="dimmed">
            Loading CivicOS session...
          </Text>
        </Stack>
      </Center>
    );
  }

  // 2. Not authenticated (after loading): redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Authenticated: render the protected page
  return <>{children}</>;
}
