import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Breadcrumbs,
  Group,
  Menu,
  Stack,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useAuth } from "../features/authentication/auth-context";

// Nav items — keep in sync with the route list in App.tsx
const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/population", label: "Population" },
  { to: "/announcements", label: "Announcements" },
  { to: "/users", label: "Users" },
];

// Breadcrumb labels — keep in sync with NAV_ITEMS / routes in App.tsx
const BREADCRUMB_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/population": "Population",
  "/announcements": "Announcements",
  "/users": "Users",
};

export function AppShellLayout() {
  // opened only matters on mobile (<sm) — desktop navbar is always visible
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { user, logout } = useAuth();

  const location = useLocation();
  // Build the trail from the path, e.g. /announcements → Dashboard / Announcements.
  // Works for nested routes later (/population/citizens → Population / Citizens).
  const crumbs = location.pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, segments) => {
      const to = "/" + segments.slice(0, index + 1).join("/");
      return { to, label: BREADCRUMB_LABELS[to] ?? segment };
    });

  // Initials from the display name, e.g. "Jane Doe" → "JD"
  const initials =
    user?.fullName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  // Flip between light/dark — Mantine persists the choice in localStorage
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
            <Text size="xl" fw={700} c="blue.7">
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

            {/* Signed-in user: avatar + name, menu holds email and logout */}
            <Menu shadow="md" width={220} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar size="sm" radius={"xl"} color="blue">
                      {initials}
                    </Avatar>
                    <Stack gap={0} align="flex-start">
                      <Text size="sm" fw={500} visibleFrom="sm">
                        {user?.fullName}
                      </Text>
                      <Text size="xs" visibleFrom="sm" c="dimmed">
                        {user?.roleName}
                      </Text>
                    </Stack>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{user?.email}</Menu.Label>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
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
        <Breadcrumbs mb="md">
          {/* Last crumb = current page → plain text; ancestors are links */}
          <Link to="/" style={{ textDecoration: "none" }}>
            Dashboard
          </Link>
          {crumbs.map((crumb, index) =>
            index === crumbs.length - 1 ? (
              <Text key={crumb.to} c="dimmed">
                {crumb.label}
              </Text>
            ) : (
              <Link key={crumb.to} to={crumb.to}>
                {crumb.label}
              </Link>
            ),
          )}
        </Breadcrumbs>
        {/* Child routes from App.tsx render here */}
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
