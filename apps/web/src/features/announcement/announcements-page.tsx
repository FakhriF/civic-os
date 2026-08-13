import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Pagination,
  Select,
  Table,
  Text,
} from "@mantine/core";
import { useDepartmentOptions } from "../../lib/use-options";
import { AnnouncementFormDialog } from "./announcement-form-dialog";
import {
  useAnnouncements,
  useArchiveAnnouncement,
  usePublishAnnouncement,
  type Announcement,
} from "./use-announcements";

// Status → badge color, kept in one place so the table stays readable
const STATUS_COLORS: Record<Announcement["status"], string> = {
  draft: "yellow",
  published: "green",
  archived: "gray",
};

const STATUS_LABELS: Record<Announcement["status"], string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

// Draft rows have no real publish date yet
const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
export function AnnouncementsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setDialogOpen(true);
  };

  const { data: departments } = useDepartmentOptions();
  const publishAnnouncement = usePublishAnnouncement();
  const archiveAnnouncement = useArchiveAnnouncement();

  const { data, isLoading, isError, isFetching } = useAnnouncements({
    page,
    limit: 10,
    status: (status as Announcement["status"]) ?? undefined,
    departmentId: departmentId ? Number(departmentId) : undefined,
  });

  const handlePublish = (announcement: Announcement) => {
    if (window.confirm(`Publish "${announcement.title}"?`)) {
      publishAnnouncement.mutate(announcement.id);
    }
  };

  const handleArchive = (announcement: Announcement) => {
    if (window.confirm(`Archive "${announcement.title}"?`)) {
      archiveAnnouncement.mutate(announcement.id);
    }
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text fw={700} size="lg">
          Announcements
        </Text>
        <Button onClick={openCreate}>New Announcement</Button>
      </Group>
      <Group mb="md">
        <Select
          placeholder="All statuses"
          clearable
          data={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ]}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        <Select
          placeholder="All departments"
          clearable
          data={
            departments?.map((department) => ({
              value: String(department.id),
              label: department.name,
            })) ?? []
          }
          value={departmentId}
          onChange={(value) => {
            setDepartmentId(value);
            setPage(1);
          }}
        />
      </Group>
      <Card withBorder padding={0} style={{ opacity: isFetching ? 0.6 : 1 }}>
        {isLoading && (
          <Text c="dimmed" ta="center" py="xl">
            Loading announcements...
          </Text>
        )}
        {isError && (
          <Text c="red" ta="center" py="xl">
            Failed to load announcements.
          </Text>
        )}
        {!isLoading && !isError && (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Published</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data && data.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text ta="center" c="dimmed" py="lg">
                      No announcements found.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {data?.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.title}</Table.Td>
                  <Table.Td>{item.departmentName}</Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_COLORS[item.status]} variant="light">
                      {STATUS_LABELS[item.status]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {item.status === "draft"
                      ? "—"
                      : formatDate(item.publishedAt)}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {item.status !== "published" && (
                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          onClick={() => handlePublish(item)}
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </Button>
                      {item.status === "published" && (
                        <Button
                          size="xs"
                          variant="light"
                          color="orange"
                          onClick={() => handleArchive(item)}
                        >
                          Archive
                        </Button>
                      )}
                    </Group>
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

      <AnnouncementFormDialog
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
      />
    </>
  );
}
