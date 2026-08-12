import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "../../services/api-client";

export interface Citizen {
  id: number;
  nationalId: string;
  fullName: string;
  gender: "male" | "female" | "other";
  birthDate: string;
  address: string;
  occupation: string;
  createdById: number;
  updatedById: number;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenListResult {
  items: Citizen[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CitizenListParams {
  page: number;
  limit: number;
  search?: string;
  gender?: "male" | "female" | "other";
}

export interface CitizenInput {
  nationalId: string;
  fullName: string;
  gender: "male" | "female" | "other";
  birthDate: string;
  address: string;
  occupation: string;
}

const CITIZENS_KEY = ["citizens"] as const;

export function useCitizens(params: CitizenListParams) {
  return useQuery({
    queryKey: [...CITIZENS_KEY, params],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/citizens", { params });
      return res.data.data as CitizenListResult;
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateCitizen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: CitizenInput) => {
      const res = await apiClient.post("/api/v1/citizens", values);
      return res.data.data as Citizen;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITIZENS_KEY });
    },
  });
}

export function useUpdateCitizen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...values
    }: { id: number } & Partial<CitizenInput>) => {
      const res = await apiClient.patch(`/api/v1/citizens/${id}`, values);
      return res.data.data as Citizen;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITIZENS_KEY });
    },
  });
}
