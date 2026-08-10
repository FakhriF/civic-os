import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { isAxiosError } from "axios";
import { useState } from "react";
import { Navigate } from "react-router";
import type { SubmitEvent } from "react";
import { useAuth } from "./auth-context";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data as
          { error?: { message?: string } } | undefined;
        setErrorMsg(data?.error?.message ?? "Invalid email or password");
      } else {
        setErrorMsg("Invalid email or password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Container size={420} my={40}>
        <Title ta="center" fw={900} c="blue.7">
          CivicOS
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5} mb={30}>
          City Public Service & Population Operations System
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md">
          {errorMsg && (
            <Alert color="red" mb="md" title="Sign In Failed">
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextInput
              label="Employee Email"
              placeholder="name@civicos.gov"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              mb="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              mb="xl"
            />

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              color="blue"
              size="md"
            >
              Sign In
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
