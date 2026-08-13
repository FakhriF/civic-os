# <Feature Name> — Design

> Status: Draft | Approved | In Progress | Complete
> Implements: <link to requirements.md>

## Overview

<How the requirements will be implemented, in a few sentences.>

## Architecture

<Where the feature lives: `apps/api` modules, `apps/web` features, `packages/*`. Keep consistent with `docs/architecture.md` and `docs/project-structure.md`.>

## API Changes

| Method | Endpoint | Auth | Request | Response | Errors |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <GET/POST/...> | <path> | <Public/Authenticated/Role> | <shape> | <shape> | <error codes> |

## Database Changes

<Schema changes, migrations, indexes, foreign keys. Reference `docs/database.md` and existing migration conventions.>

## Data Flow

<Sequence of requests/events and where each step is handled.>

## Frontend Behavior

<Pages, components, states (loading/empty/error). Reference existing features in `apps/web/src/features`.>

## Backend Behavior

<Services, business logic, validation. Reference existing modules in `apps/api/src/modules`.>

## Authentication & Authorization

<Which roles can access what. Follow the existing RBAC mechanism.>

## Error Handling

<Error codes and messages consistent with the API contracts in `docs/development-standards.md`.>

## Security Considerations

<Secrets, user data, permissions, anything security-sensitive.>

## Testing Strategy

- Unit tests: <what>
- Integration / API tests: <what>
- Component tests: <what>
- End-to-end tests: <what>

## Open Questions

- <question that must be resolved before or during implementation>
