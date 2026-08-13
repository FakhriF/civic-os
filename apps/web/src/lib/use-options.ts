import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/api-client";

export interface IdNameOption {
  id: number;
  name: string;
}

export function useRoleOptions() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/roles");
      return res.data.data as IdNameOption[];
    },
  });
}

export function useDepartmentOptions() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/departments");
      return res.data.data as IdNameOption[];
    },
  });
}
