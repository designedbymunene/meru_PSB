import "../global.css";
import { AuthProvider } from "../context/auth-context";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppQueryProvider } from "@/lib/query/provider";
import { ThemeProvider } from "@/context/theme-context";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useEffect, useMemo } from "react";
import { subscribeToForegroundNotifications } from "@/lib/notifications/push";
import { LogBox } from "react-native";
import { Stack } from "expo-router";
import { useOtaUpdates } from "@/hooks/use-ota-updates";

LogBox.ignoreAllLogs();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const isDark = useMemo(() => colorScheme === "dark", [colorScheme]);

  const bgStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#ffffff'
  }), [isDark]);

  useEffect(() => {
    const subscription = subscribeToForegroundNotifications();
    return () => subscription.remove();
  }, []);

  // Initialize automatic OTA update checking
  useOtaUpdates();

  return (
    <GestureHandlerRootView style={bgStyle}>
      <SafeAreaProvider>
        <ThemeProvider isDark={isDark}>
          <AppQueryProvider>
            <AuthProvider>
              <StatusBar style={isDark ? "light" : "dark"} />
              <Toaster />
              <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
          </AppQueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
