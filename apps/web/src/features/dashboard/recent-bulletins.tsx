import { Card, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/api-client";

interface Announcement {
  id: number;
  title: string;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
}

export function RecentBulletins() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["announcements", "recent"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/announcements?limit=5");
      return res.data.data as Announcement[];
    },
  });

  if (isLoading) return <Text c="dimmed">Loading bulletins...</Text>;
  if (isError) return <Text c="red">Failed to load bulletins.</Text>;

  if (!data || data.length === 0) {
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
      {data.map((item) => (
        <Text key={item.id} size="sm">
          {item.title}
        </Text>
      ))}
    </Card>
  );
}
