import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "../features/authentication/auth-context";

// Nav items — keep in sync with the route list in App.tsx
const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/population", label: "Population" },
  { to: "/announcements", label: "Announcements" },
  { to: "/users", label: "Users" },
];

export function AppShellLayout() {
  // opened only matters on mobile (<sm) — desktop navbar is always visible
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { user, logout } = useAuth();

  const initials =
    user?.fullName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  const toggleColorScheme = () =>
    setColorScheme(colorScheme === "dark" ? "light" : "dark");

  return (
    <AppShell
      padding={"md"}
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px={"md"} justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size={"sm"}
            />
            <Text size="xl" fw={700}>
              CivicOS
            </Text>
          </Group>
          <Group>
            <ActionIcon
              variant="default"
              size={"lg"}
              onClick={toggleColorScheme}
              title="Toggle Color Scheme"
            >
              {colorScheme === "dark" ? <IconSun /> : <IconMoon />}
            </ActionIcon>

            <Menu shadow="md" width={220} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar size="sm" radius={"xl"} color="blue">
                      {initials}
                    </Avatar>
                    <Text size="sm" fw={500} visibleFrom="sm">
                      {user?.fullName}
                    </Text>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{user?.email}</Menu.Label>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14}></IconLogout>}
                  onClick={() => {
                    void logout();
                  }}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={"md"}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            // end makes sure "/" (Dashboard) doesn't stay highlighted on other routes
            end={item.to === "/"}
            style={({ isActive }) => ({
              // Mantine CSS vars: highlight adapts in dark mode (Primary token = blue 7)
              display: "block",
              padding: "8px 12px",
              borderRadius: 6,
              color: isActive ? "var(--mantine-color-blue-7)" : "inherit",
              backgroundColor: isActive
                ? "var(--mantine-color-blue-light)"
                : "transparent",
              textDecoration: "none",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        {/* Child routes from App.tsx render here */}
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
