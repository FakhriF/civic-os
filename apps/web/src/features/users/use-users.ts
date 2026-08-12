import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../services/api-client";

export interface UserItem {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  departmentId: number;
  departmentName: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserCreateValues {
  email: string;
  fullName: string;
  password: string;
  roleId: number;
  departmentId: number;
}

export interface UserUpdateValues {
  fullName?: string;
  password?: string;
  roleId?: number;
  departmentId?: number;
  isActive?: boolean;
}

// Shared key so every mutation invalidates the same list
const USERS_KEY = ["users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/users");
      return res.data.data as UserItem[];
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: UserCreateValues) => {
      const res = await apiClient.post("/api/v1/users", values);
      return res.data.data as UserItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...values
    }: { id: number } & UserUpdateValues) => {
      const res = await apiClient.patch(`/api/v1/users/${id}`, values);
      return res.data.data as UserItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}
