# AGENTS.md

This document serves as the primary operational guide for AI agents and developers working on the **Are You Dead** project. It outlines the architecture, build procedures, code standards, and conventions to ensure consistency and reliability.

## 1. Project Overview & Architecture

**Are You Dead** is a "dead man's switch" mobile application built with **Expo (React Native)** for the frontend and **Convex** for the realtime backend and automation.

### Tech Stack
-   **Runtime/Package Manager:** [Bun](https://bun.sh) (Strictly required over npm/yarn)
-   **Frontend:** Expo SDK 54, React Native 0.81, TypeScript.
-   **Navigation:** Expo Router (File-based routing in `app/`).
-   **Backend:** Convex (Realtime database, server functions, cron jobs).
-   **State/Data:** Convex React Hooks (`useQuery`, `useMutation`).
-   **Storage:** `expo-secure-store` for persistent device identity.

### Directory Structure
-   `app/`: Frontend screens and navigation (Expo Router).
    -   `(tabs)/`: Main tab layout (Check In, Contacts, Settings).
    -   `_layout.tsx`: Root layout with providers.
-   `convex/`: Backend schema, functions, and actions.
    -   `schema.ts`: Database definition (`users`, `contacts`).
    -   `crons.ts`: Scheduled tasks (Dead man switch checks).
    -   `deadMan.ts`: Core logic for determining inactivity.
-   `hooks/`: Shared React hooks (e.g., `useUserId`).

---

## 2. Environment & Commands

Agents must use **Bun** for all package operations.

### Setup & Installation
```bash
bun install
```

### Running the Project
1.  **Start the Backend:**
    The Convex backend must be running for the app to function.
    ```bash
    bun convex dev
    ```
    *Note: This generates types in `convex/_generated/`. Run this if backend types are missing.*

2.  **Start the Frontend:**
    ```bash
    bun start
    ```
    (Select `i` for iOS simulator or `a` for Android emulator).

### Verification & Testing
Currently, the project relies on TypeScript for static analysis.

-   **Type Check:**
    ```bash
    bun tsc
    ```
    *Always run this before submitting changes.*

-   **Linting:**
    (Not yet configured. Follow the code style guidelines below strictly.)

-   **Testing:**
    (Unit tests are not yet set up. Rely on manual verification and TypeScript.)

---

## 3. Code Style & Conventions

### General Guidelines
-   **TypeScript:** Use strict typing. Avoid `any`. Interfaces/Types should be explicit.
-   **Functional Components:** Use function declarations (`export default function Name() {}`).
-   **Async/Await:** Prefer `async/await` over `.then()`.

### Imports Ordering
1.  **External Libraries:** React, React Native, Expo, Third-party.
2.  **Convex:** `convex/react`, `convex/values`.
3.  **Internal Convex API:** `../../convex/_generated/api`.
4.  **Local Modules:** Hooks, Components, Utils.
5.  **Styles:** `StyleSheet`.

**Example:**
```typescript
import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUserId } from "../../hooks/useUserId";
```

### Expo Router
-   **Screens:** All screens reside in `app/`.
-   **Layouts:** Use `_layout.tsx` for nested navigators (Stacks/Tabs).
-   **Navigation:** Use `<Link href="...">` for simple transitions or `router.push()` for imperative navigation.
-   **Tab Icons:** Use `@expo/vector-icons` (Ionicons preferred).

### Convex Backend
-   **Schema:** Defined in `convex/schema.ts` using `defineTable`.
-   **Functions:**
    -   `query`: Read-only data fetching.
    -   `mutation`: Data modification (database writes).
    -   `action`: Third-party API calls (Notifications).
    -   `internalQuery`/`internalMutation`: For use by Crons/Actions only (not exposed to client).
-   **Arguments:** Always validate arguments using `v` (e.g., `args: { token: v.string() }`).
-   **React Hooks:**
    -   Use `useQuery(api.module.func, args)` for data.
    -   Use `useMutation(api.module.func)` for actions.
    -   Handle `undefined` loading states gracefully.

### Styling
-   Use `StyleSheet.create({})` at the bottom of the file.
-   Avoid inline styles for layout or complex properties.
-   Use descriptive names (`container`, `title`, `card`, `button`).
-   **Color Palette:**
    -   Primary: `#007AFF` (Blue)
    -   Danger: `#FF3B30` (Red)
    -   Success: `#34C759` (Green)
    -   Text: `#333` (Dark), `#666` (Gray)

### Error Handling
-   **Backend:** Throw `Error("Message")` in Convex functions for client-facing errors.
-   **Frontend:** Display user-friendly alerts for validation errors (e.g., `Alert.alert("Title", "Message")`).
-   **Loading:** Always handle `userId === null` or `data === undefined` states before rendering main content.

---

## 4. Specific Workflows

### The "Dead Man" Logic
1.  **User Action:** User presses "I'M ALIVE".
2.  **Mutation:** `checkIn` updates `lastCheckIn` timestamp.
3.  **Cron Job:** `crons.ts` runs every hour, calling `deadMan.checkDeadUsers`.
4.  **Logic:** `deadMan.ts` queries for users where `now - lastCheckIn > 48 hours`.
5.  **Notification:** If dead and not recently notified, an `action` is triggered to send mock SMS/Email.

### Adding a New Screen
1.  Create `app/(tabs)/newscreen.tsx`.
2.  Add the screen to `app/(tabs)/_layout.tsx` with an icon.
3.  Implement the UI and Convex queries.

### Adding a New Backend Feature
1.  Define/Update Schema in `convex/schema.ts` (if needed).
2.  Create/Update function in `convex/yourModule.ts`.
3.  Run `bun convex dev` to regenerate API types.
4.  Consume in frontend via `api.yourModule.func`.

---

## 5. Security Best Practices
-   **Secrets:** Never commit API keys. Use `.env.local` for `EXPO_PUBLIC_CONVEX_URL` and Convex Dashboard for backend secrets.
-   **Identity:** Users are authenticated via a random UUID stored in `SecureStore`. This is an *anonymous* identity model. Do not expose this token in public queries unrelated to the user.
-   **Validation:** Always validate data in Convex mutations before writing to the database.

