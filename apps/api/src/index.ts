import { Elysia } from "elysia";

const app = new Elysia().get("/", () => "Hello CivicOS").listen(3000);

console.log(
  `CivicOS is running at ${app.server?.hostname}:${app.server?.port}`
);
