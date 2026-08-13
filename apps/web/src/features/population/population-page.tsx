import { useDebouncedValue } from "@mantine/hooks";
import { useState } from "react";
import { useCitizens, type Citizen } from "./use-citizens";
import {
  Button,
  Card,
  Group,
  Pagination,
  Select,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { CitizenFormDialog } from "./citizen-form-dialog";

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export function PopulationPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Citizen | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (citizen: Citizen) => {
    setEditing(citizen);
    setDialogOpen(true);
  };

  const { data, isLoading, isError, isFetching } = useCitizens({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    gender: (gender as "male" | "female" | "other") ?? undefined,
  });

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text fw={700} size="lg">
          Population Registry
        </Text>
        <Button onClick={openCreate}>Add Citizen</Button>
      </Group>
      <Group mb="md">
        <TextInput
          placeholder="Search by NIK or name"
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
        />
        <Select
          placeholder="All genders"
          clearable
          data={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ]}
          value={gender}
          onChange={(value) => {
            setGender(value);
            setPage(1);
          }}
        />
      </Group>
      <Card withBorder padding={0} style={{ opacity: isFetching ? 0.6 : 1 }}>
        {isLoading && (
          <Text c="dimmed" ta="center" py="xl">
            Loading citizens...
          </Text>
        )}
        {isError && (
          <Text c="red" ta="center" py="xl">
            Failed to load citizens.
          </Text>
        )}
        {!isLoading && !isError && (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>National ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Gender</Table.Th>
                <Table.Th>Birth Date</Table.Th>
                <Table.Th>Occupation</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data && data.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" py="lg">
                      No citizens found.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {data?.items.map((citizen) => (
                <Table.Tr key={citizen.id}>
                  <Table.Td>{citizen.nationalId}</Table.Td>
                  <Table.Td>{citizen.fullName}</Table.Td>
                  <Table.Td>
                    {GENDER_LABELS[citizen.gender] ?? citizen.gender}
                  </Table.Td>
                  <Table.Td>{citizen.birthDate}</Table.Td>
                  <Table.Td>{citizen.occupation}</Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => openEdit(citizen)}
                    >
                      Edit
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Group justify="center" mt="md">
        <Pagination
          total={data?.totalPages ?? 1}
          value={page}
          onChange={setPage}
        />
      </Group>
      <CitizenFormDialog
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
      />
    </>
  );
}
