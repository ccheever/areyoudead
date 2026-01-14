import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { UserIdProvider } from "../hooks/useUserId";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <UserIdProvider>
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: true, title: 'Settings' }} />
        </Stack>
      </UserIdProvider>
    </ConvexProvider>
  );
}
