import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { useDepartmentOptions } from "../../lib/use-options";
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
  type Announcement,
} from "./use-announcements";

interface AnnouncementFormDialogProps {
  opened: boolean;
  onClose: () => void;
  editing?: Announcement | null;
}

export function AnnouncementFormDialog({
  opened,
  onClose,
  editing,
}: AnnouncementFormDialogProps) {
  const isEdit = editing !== null;
  const { data: departments } = useDepartmentOptions();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync the form with the row being edited each time the modal opens
  useEffect(() => {
    if (opened) {
      setTitle(editing?.title ?? "");
      setContent(editing?.content ?? "");
      setDepartmentId(editing ? String(editing.departmentId) : null);
      setErrorMsg(null);
    }
  }, [opened, editing]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const values = {
      title,
      content,
      departmentId: Number(departmentId),
    };

    try {
      if (isEdit) {
        await updateAnnouncement.mutateAsync({ id: editing!.id, ...values });
      } else {
        await createAnnouncement.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data as
          { error?: { message?: string } } | undefined;
        setErrorMsg(
          data?.error?.message ??
            "An error occurred, Failed to save announcement.",
        );
      } else {
        setErrorMsg("An error occurred, Failed to save announcement.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentData =
    departments?.map((department) => ({
      value: String(department.id),
      label: department.name,
    })) ?? [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? "Edit Announcement" : "Create Announcement"}
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          mb="md"
        />
        <Textarea
          label="Content"
          required
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          minRows={4}
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
            {isEdit ? "Save Changes" : "Create Announcement"}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
