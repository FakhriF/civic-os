import { Navigate, Route, Routes } from "react-router";
import { LoginPage } from "./features/authentication/login-page";
import { ProtectedRoute } from "./features/authentication/protected-route";
import { AppShellLayout } from "./layouts/app-shell";
import { DashboardPage } from "./features/dashboard/dashboard-page";
import { UsersPage } from "./features/users/users-page";
import { PopulationPage } from "./features/population/population-page";
import { AnnouncementsPage } from "./features/announcement/announcements-page";

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
        <Route path="population" element={<PopulationPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
