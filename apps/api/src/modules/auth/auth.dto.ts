import { t } from "elysia";

export const LoginBodyDTO = t.Object({
  email: t.String({ format: "email", error: "Must be a valid email address!" }),
  password: t.String({
    minLength: 6,
    error: "Password must be at least 6 characters",
  }),
});
