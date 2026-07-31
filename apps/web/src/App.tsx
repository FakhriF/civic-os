import { AppShell, Burger, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';


export default function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
          padding="md"
          header={{ height: 60 }}
          navbar={{
            width: 300,
            breakpoint: 'sm',
            collapsed: { mobile: !opened },
          }}
        >
          <AppShell.Header>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />

            <div>
              <Text size="xl" fw={700}>Large text</Text>
            </div>
          </AppShell.Header>

          <AppShell.Navbar>Navbar</AppShell.Navbar>

          <AppShell.Main>Main</AppShell.Main>
        </AppShell>
  );
}
