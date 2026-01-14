# Are You Dead?

An Expo app that acts as a dead man's switch. You must check in every 2 days, or your emergency contacts will be notified.

## Setup

1.  **Install Dependencies:**
    ```bash
    bun install
    ```

2.  **Start Backend:**
    ```bash
    bun convex dev
    ```
    (Keep this running in a separate terminal)

3.  **Start App:**
    ```bash
    bun start
    ```

## Features

-   **I'M ALIVE:** Resets your 48-hour timer.
-   **Contacts:** Add email/phone for emergency contacts.
-   **Notifications:** If the timer runs out, a cron job triggers (simulated) SMS/Email notifications to your contacts.

## Tech Stack

-   **Frontend:** React Native (Expo)
-   **Backend:** Convex (Database, Functions, Cron, Actions)
-   **Auth:** Device-based anonymous identity (stored in SecureStore)
