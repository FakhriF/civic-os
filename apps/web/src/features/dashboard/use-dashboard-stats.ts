import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/api-client";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  // keep plural — matches the backend field in dashboard.routes.ts
  totalAnnouncements: number;
}

// Query key pattern: ["domain", "resource"] — keep stable so TanStack can cache/dedupe
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/dashboard/stats");
      return res.data.data as DashboardStats;
    },
  });
}
