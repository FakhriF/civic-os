import { app } from "./app";

app.listen(3000);

console.log(
  `CivicOS is running at ${app.server?.hostname}:${app.server?.port}`,
);
