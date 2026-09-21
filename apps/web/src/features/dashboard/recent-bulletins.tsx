import { Card, Group, Stack, Text, Title, Tooltip } from "@mantine/core";
import { useAnnouncements } from "../announcement/use-announcements";
import { formatDistanceToNow, format } from 'date-fns';
import { enUS } from 'date-fns/locale';

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
        <Card key={item.id} withBorder>
          <Stack>
            <Group>
              <Title order={3}>  {item.title}</Title>
              <Tooltip label={format(new Date(item.publishedAt), 'd MMMM yyyy, HH:mm', { locale: enUS })}>
                <Text size="xs" c="dimmed">
                  {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true, locale: enUS })}
                </Text>
              </Tooltip>
            </Group>
            <Text size="sm">
              {item.content}
            </Text>
            <Text size="sm" c={"dimmed"}>
              by {item.departmentName} Department
            </Text>
          </Stack>
        </Card>
      ))}
    </Card>
  );
}
