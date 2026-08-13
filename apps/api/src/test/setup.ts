// Preload for the test suite (bun test --preload ./src/test/setup.ts).
//
// DATABASE_URL is pointed at the isolated test database BEFORE any module
// imports database/client.ts (which reads it at load time). The dev .env.local
// is loaded with dotenv's default override: false, so this value always wins.

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://civicos:civicos_test@localhost:5433/civicos_test";
