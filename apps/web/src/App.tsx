import { Text } from "@mantine/core";
import { Navigate, Route, Routes } from "react-router";
import { LoginPage } from "./features/authentication/login-page";
import { ProtectedRoute } from "./features/authentication/protected-route";
import { AppShellLayout } from "./layouts/app-shell";
import { DashboardPage } from "./features/dashboard/dashboard-page";
import { UsersPage } from "./features/users/users-page";

// Temporary placeholder — real pages land with their milestones (M6 population, M7 announcements)
function PagePlaceholder({ title }: { title: string }) {
  return <Text mt="xl">{title} — coming soon</Text>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Layout route (no path): AppShell wraps every child page, auth guard on top */}
      <Route
        element={
          <ProtectedRoute>
            <AppShellLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="population"
          element={<PagePlaceholder title="Population" />}
        />
        <Route
          path="announcements"
          element={<PagePlaceholder title="Announcements" />}
        />
        <Route path="users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
