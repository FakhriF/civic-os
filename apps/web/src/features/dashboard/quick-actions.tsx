import { Button, Card, Stack, Text } from "@mantine/core";
import {
  IconBellPlus,
  IconUserPlus,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";

// Each action points at a placeholder page — the real forms ship with M5–M7
const QUICK_ACTIONS = [
  { to: "/users", label: "Add User", icon: IconUserPlus },
  { to: "/population", label: "Register Citizen", icon: IconUsersGroup },
  { to: "/announcements", label: "New Announcement", icon: IconBellPlus },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card withBorder>
      <Text fw={600} mb={"sm"}>
        Quick Actions
      </Text>
      <Stack gap="xs">
        {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
          <Button
            key={to}
            variant="light"
            leftSection={<Icon size={16} />}
            onClick={() => navigate(to)}
          >
            {label}
          </Button>
        ))}
      </Stack>
      <Text size="xs" c="dimmed" mt="sm">
        Module pages ship with M5–M7
      </Text>
    </Card>
  );
}
