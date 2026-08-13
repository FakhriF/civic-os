import { Grid, Title } from "@mantine/core";
import { StatsCard } from "./stats-card";
import { RecentBulletins } from "./recent-bulletins";
import { QuickActions } from "./quick-actions";

export function DashboardPage() {
  return (
    <>
      <Title order={2} mb="lg">
        Executive Dashboard
      </Title>
      <StatsCard />
      <Grid mt="lg">
        {/* Bulletins get the wide column (8/12), quick actions the side column (4/12) */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <RecentBulletins />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <QuickActions />
        </Grid.Col>
      </Grid>
    </>
  );
}
