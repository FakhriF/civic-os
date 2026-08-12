import { Badge, Button, Card, Group, Table, Text } from "@mantine/core";
import { useState } from "react";
import { useAuth } from "../authentication/auth-context";
import { UserFormDialog } from "./user-form-dialog";
import { useUpdateUser, useUsers, type UserItem } from "./use-users";

export function UsersPage() {
  const { data, isLoading, isError } = useUsers();
  const updateUser = useUpdateUser();
  const { user: currentUser } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);

  if (isLoading) return <Text c="dimmed">Loading users...</Text>;
  if (isError) return <Text c="red">Failed to load users.</Text>;

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (user: UserItem) => {
    setEditing(user);
    setDialogOpen(true);
  };

  const toggleActive = (user: UserItem) => {
    if (
      window.confirm(
        `${user.isActive ? "Deactivate" : "Reactivate"} ${user.fullName}?`,
      )
    ) {
      updateUser.mutate({ id: user.id, isActive: !user.isActive });
    }
  };
  return (
    <>
      <Group justify="space-between" mb="md">
        <Text fw={700} size="lg">
          User Directory
        </Text>
        <Button onClick={openCreate}>Add User</Button>
      </Group>
      <Card withBorder padding={0}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data && data.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed" py="lg">
                    No users yet.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {data?.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.fullName}</Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>{user.roleName}</Table.Td>
                <Table.Td>{user.departmentName}</Table.Td>
                <Table.Td>
                  <Badge
                    color={user.isActive ? "green" : "red"}
                    variant="light"
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => openEdit(user)}
                    >
                      Edit
                    </Button>
                    {/* Hide the toggle for the signed-in user (R4.2) */}
                    {user.id !== currentUser?.id && (
                      <Button
                        size="xs"
                        variant="light"
                        color={user.isActive ? "red" : "green"}
                        onClick={() => toggleActive(user)}
                      >
                        {user.isActive ? "Deactivate" : "Reactivate"}
                      </Button>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <UserFormDialog
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
      />
    </>
  );
}
