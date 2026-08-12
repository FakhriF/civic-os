import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "../../services/api-client";

export interface Announcement {
  id: number;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  publishedAt: string;
  departmentId: number;
  departmentName: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementListResult {
  items: Announcement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnnouncementListParams {
  page: number;
  limit: number;
  status?: "draft" | "published" | "archived";
  departmentId?: number;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  departmentId: number;
}

const ANNOUNCEMENTS_KEY = ["announcements"] as const;

export function useAnnouncements(params: AnnouncementListParams) {
  return useQuery({
    queryKey: [...ANNOUNCEMENTS_KEY, params],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/announcements", { params });
      return res.data.data as AnnouncementListResult;
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: AnnouncementInput) => {
      const res = await apiClient.post("/api/v1/announcements", values);
      return res.data.data as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...values
    }: { id: number } & Partial<AnnouncementInput>) => {
      const res = await apiClient.patch(`/api/v1/announcements/${id}`, values);
      return res.data.data as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY });
    },
  });
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post(`/api/v1/announcements/${id}/publish`);
      return res.data.data as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY });
    },
  });
}

export function useArchiveAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post(`/api/v1/announcements/${id}/archive`);
      return res.data.data as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY });
    },
  });
}
