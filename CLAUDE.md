# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

**Package manager:** Bun (required, not npm/yarn)

```bash
bun install              # Install dependencies
bun convex dev           # Start Convex backend (regenerates types in convex/_generated/)
bun start                # Start Expo dev server (press 'i' for iOS, 'a' for Android)
bun tsc                  # Type check - run before committing
```

Both `bun convex dev` and `bun start` must run simultaneously for full functionality.

## Project Overview

Dead man's switch mobile app - users check in every 48 hours or emergency contacts get notified.

**Stack:** Expo (React Native) + Convex (realtime backend) + TypeScript (strict mode)

## Architecture

- **Frontend (`app/`)**: Expo Router file-based routing. Main screen is `index.tsx` with check-in button.
- **Backend (`convex/`)**: Serverless functions, schema, and cron jobs.
  - `schema.ts`: Database tables (`users`, `contacts`)
  - `deadMan.ts`: Core logic for detecting overdue users
  - `crons.ts`: Hourly job that checks for dead users
  - `_generated/`: Auto-generated types (never edit manually)
- **Hooks (`hooks/`)**: `useUserId` provides device UUID from SecureStore
- **Utils (`utils/`)**: Deadline calculation and notification scheduling

**Data flow:** User action → `useMutation` hook → Convex mutation → realtime update via `useQuery`

**Auth model:** Anonymous device-based identity. Each device gets a UUID stored in `expo-secure-store`.

## Key Patterns

- Conditional queries use `"skip"`: `userId ? { token: userId } : "skip"`
- Debug modes (`1min`, `10sec`) in settings for testing with fast deadlines
- Notifications in `actions.ts` currently log to console (mock implementation)

## See Also

`AGENTS.md` contains detailed code style guidelines, import ordering, Convex patterns, and workflow documentation.
