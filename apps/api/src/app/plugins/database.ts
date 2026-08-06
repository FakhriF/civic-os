import {Elysia} from "elysia";
import { db } from "../../database/client";

export const databasePlugin = new Elysia({ name: "database-plugin" })
  .decorate("db", db)
