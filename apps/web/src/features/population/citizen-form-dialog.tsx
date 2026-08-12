import { Alert, Button, Group, Modal, Select, TextInput } from "@mantine/core";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import {
  useCreateCitizen,
  useUpdateCitizen,
  type Citizen,
} from "./use-citizens";

interface CitizenFormDialogProps {
  opened: boolean;
  onClose: () => void;
  editing?: Citizen | null; // null = create mode
}

export function CitizenFormDialog({
  opened,
  onClose,
  editing,
}: CitizenFormDialogProps) {
  const isEdit = editing !== null;
  const createCitizen = useCreateCitizen();
  const updateCitizen = useUpdateCitizen();

  const [nationalId, setNationalId] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync the form every time the dialog opens (create or edit)
  useEffect(() => {
    if (opened) {
      setNationalId(editing?.nationalId ?? "");
      setFullName(editing?.fullName ?? "");
      setGender(editing?.gender ?? null);
      setBirthDate(editing?.birthDate ?? "");
      setAddress(editing?.address ?? "");
      setOccupation(editing?.occupation ?? "");
      setErrorMsg(null);
    }
  }, [opened, editing]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const profile = {
      fullName,
      gender: gender as "male" | "female" | "other",
      birthDate,
      address,
      occupation,
    };

    try {
      if (isEdit) {
        await updateCitizen.mutateAsync({ id: editing!.id, ...profile });
      } else {
        await createCitizen.mutateAsync({ nationalId, ...profile });
      }
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data as
          { error?: { message?: string } } | undefined;
        setErrorMsg(data?.error?.message ?? "Failed to save citizen.");
      } else {
        setErrorMsg("Failed to save citizen.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? "Edit Citizen" : "Add Citizen"}
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          label="National ID"
          required
          disabled={isEdit}
          value={nationalId}
          onChange={(e) => setNationalId(e.currentTarget.value)}
          mb="md"
        />
        <TextInput
          label="Full Name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.currentTarget.value)}
          mb="md"
        />
        <Select
          label="Gender"
          required
          data={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ]}
          value={gender}
          onChange={setGender}
          mb="md"
        />
        {/* Native date input — no extra date-picker dependency (spec decision) */}
        <TextInput
          label="Birth Date"
          required
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.currentTarget.value)}
          mb="md"
        />
        <TextInput
          label="Address"
          required
          value={address}
          onChange={(e) => setAddress(e.currentTarget.value)}
          mb="md"
        />
        <TextInput
          label="Occupation"
          required
          value={occupation}
          onChange={(e) => setOccupation(e.currentTarget.value)}
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
            {isEdit ? "Save Changes" : "Create Citizen"}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
