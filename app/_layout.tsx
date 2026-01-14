import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { UserIdProvider } from "../hooks/useUserId";
import { useFonts, JosefinSans_400Regular, JosefinSans_700Bold, JosefinSans_600SemiBold } from '@expo-google-fonts/josefin-sans';
import { View, ActivityIndicator } from "react-native";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    JosefinSans_400Regular,
    JosefinSans_600SemiBold,
    JosefinSans_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }

  return (
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
                headerStyle: { backgroundColor: '#F8C8DC' },
                headerTintColor: '#333',
                headerTitleStyle: { fontFamily: 'JosefinSans_700Bold' },
                contentStyle: { backgroundColor: '#F8C8DC' } // Set default bg for stack screen
              }} 
            />
        </Stack>
      </UserIdProvider>
    </ConvexProvider>
  );
}
