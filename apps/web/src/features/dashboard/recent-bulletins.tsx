import { Card, Text } from "@mantine/core";
import { useAnnouncements } from "../announcement/use-announcements";

export function RecentBulletins() {
  const { data, isLoading, isError } = useAnnouncements({
    page: 1,
    limit: 5,
    status: "published",
  });

  if (isLoading) return <Text c="dimmed">Loading bulletins...</Text>;
  if (isError) return <Text c="red">Failed to load bulletins.</Text>;

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <Card withBorder>
        <Text c="dimmed" ta="center" py="lg">
          No published announcements yet.
        </Text>
      </Card>
    );
  }

  return (
    <Card withBorder>
      {items.map((item) => (
        <Text key={item.id} size="sm">
          {item.title}
        </Text>
      ))}
    </Card>
  );
}
