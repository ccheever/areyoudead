import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { UserIdProvider } from "../hooks/useUserId";
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

const convex = new ConvexReactClient("https://tidy-jaguar-132.convex.cloud", {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ActionSheetProvider useNativeDriver={true}>
      <ConvexProvider client={convex}>
        <UserIdProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen
              name="settings"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Settings',
                headerStyle: { backgroundColor: '#F2F2F7' },
                headerTintColor: '#333',
                headerTitleStyle: { fontWeight: '700' },
                contentStyle: { backgroundColor: '#F2F2F7' }
              }}
            />
            <Stack.Screen
              name="contacts"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Emergency Contacts',
                headerStyle: { backgroundColor: '#F2F2F7' },
                headerTintColor: '#333',
                headerTitleStyle: { fontWeight: '700' },
                contentStyle: { backgroundColor: '#F2F2F7' }
              }}
            />
            <Stack.Screen
              name="debugging"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Debugging',
                headerStyle: { backgroundColor: '#F2F2F7' },
                headerTintColor: '#333',
                headerTitleStyle: { fontWeight: '700' },
                contentStyle: { backgroundColor: '#F2F2F7' }
              }}
            />
          </Stack>
        </UserIdProvider>
      </ConvexProvider>
    </ActionSheetProvider>
  );
}
