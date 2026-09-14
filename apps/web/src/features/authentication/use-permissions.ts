import { useAuth } from "./auth-context";

export function usePermissions() {
  const { user } = useAuth();
  const roleName = user?.roleName;

  const can = (...names: string[]) =>
    roleName !== undefined && names.includes(roleName);

  return { can, roleName };
}
