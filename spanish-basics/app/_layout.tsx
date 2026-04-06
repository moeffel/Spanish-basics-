import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "../src/context/AppContext";
import { COLORS } from "../src/utils/constants";

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="lesson/[id]"
          options={{
            title: "Lektion",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="vocabulary/[id]"
          options={{
            title: "Vokabeln",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="grammar/[id]"
          options={{
            title: "Grammatik",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="pronunciation/[id]"
          options={{
            title: "Aussprache",
            presentation: "card",
          }}
        />
      </Stack>
    </AppProvider>
  );
}
