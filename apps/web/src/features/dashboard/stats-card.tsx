import {
  Card,
  Group,
  Loader,
  SimpleGrid,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBell,
  IconBuildingBank,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import { useDashboardStats, type DashboardStats } from "./use-dashboard-stats";

// Colors follow the semantic tokens in docs/design.md:
// blue = primary, green = success, cyan = info, yellow = warning
const STAT_CONFIGS: {
  key: keyof DashboardStats;
  label: string;
  icon: typeof IconUsers;
  color: string;
}[] = [
  { key: "totalUsers", label: "Total Users", icon: IconUsers, color: "blue" },
  {
    key: "activeUsers",
    label: "Active Users",
    icon: IconUserCheck,
    color: "green",
  },
  {
    key: "totalDepartments",
    label: "Departments",
    icon: IconBuildingBank,
    color: "cyan",
  },
  {
    key: "totalAnnouncements",
    label: "Announcements",
    icon: IconBell,
    color: "yellow",
  },
];
export function StatsCard() {
  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return <Loader size="sm" />;
  }

  if (isError) {
    return <Text c="red">Failed to load dashboard stats.</Text>;
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
      {STAT_CONFIGS.map(({ key, label, icon: Icon, color }) => (
        <Card key={key} withBorder>
          <Group>
            <ThemeIcon color={color} variant="light" size="lg" radius="md">
              <Icon size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">
                {label}
              </Text>
              <Text fw={700} size="xl">
                {data?.[key] ?? 0}
              </Text>
            </div>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
