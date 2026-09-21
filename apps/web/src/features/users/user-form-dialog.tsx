import {
  Alert,
  Button,
  Group,
  Modal,
  PasswordInput,
  Select,
  TextInput,
} from "@mantine/core";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { useDepartmentOptions, useRoleOptions } from "../../lib/use-options";
import { useCreateUser, useUpdateUser, type UserItem } from "./use-users";

interface UserFormDialogProps {
  opened: boolean;
  onClose: () => void;
  editing?: UserItem | null;
}

export function UserFormDialog({
  opened,
  onClose,
  editing,
}: UserFormDialogProps) {
  const isEdit = editing !== null;
  const { data: roles } = useRoleOptions();
  const { data: departments } = useDepartmentOptions();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (opened) {
      setEmail(editing?.email ?? "");
      setFullName(editing?.fullName ?? "");
      setPassword("");
      setRoleId(editing ? String(editing.roleId) : null);
      setDepartmentId(editing ? String(editing.departmentId) : null);
      setErrorMsg(null);
    }
  }, [opened, editing]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const profile = {
      fullName,
      roleId: Number(roleId),
      departmentId: Number(departmentId),
    };

    try {
      if (isEdit) {
        await updateUser.mutateAsync({ id: editing!.id, ...profile, ...password ? { password } : {} });
      } else {
        await createUser.mutateAsync({ email, ...profile, password });
      }
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data as
          { error?: { message?: string } } | undefined;
        setErrorMsg(data?.error?.message ?? "Failed to save user.");
      } else {
        setErrorMsg("Failed to save user.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleData =
    roles?.map((role) => ({ value: String(role.id), label: role.name })) ?? [];
  const departmentData =
    departments?.map((department) => ({
      value: String(department.id),
      label: department.name,
    })) ?? [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? "Edit User" : "Add User"}
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          required
          disabled={isEdit}
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          mb="md"
        />
        <TextInput
          label="Full Name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.currentTarget.value)}
          mb="md"
        />
        <PasswordInput
          label="Password"
          required={!isEdit}
          placeholder={isEdit ? "Leave empty to keep current" : undefined}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          mb="md"
        />
        <Select
          label="Role"
          required
          data={roleData}
          value={roleId}
          onChange={setRoleId}
          mb="md"
        />
        <Select
          label="Department"
          required
          data={departmentData}
          value={departmentId}
          onChange={setDepartmentId}
          mb="md"
        />

        {errorMsg && (
          <Alert color="red" mb="md">
            {errorMsg}
          </Alert>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save Changes" : "Create User"}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
