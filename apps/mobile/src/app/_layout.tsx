import "../global.css";
import { AuthProvider } from "../context/auth-context";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppQueryProvider } from "@/lib/query/provider";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useEffect, useMemo } from "react";
import { subscribeToForegroundNotifications } from "@/lib/notifications/push";
import { LogBox } from "react-native";
import { Stack } from "expo-router";

LogBox.ignoreAllLogs();

// Custom themes to match the app aesthetic
const CustomDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#004aad',
    background: '#ffffff',
    card: '#ffffff',
    border: '#f1f5f9',
    text: '#0f172a',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#3b82f6',
    background: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    text: '#f8fafc',
  },
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  
  const theme = useMemo(() => 
    colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme, 
  [colorScheme]);

  const bgStyle = useMemo(() => ({ 
    flex: 1, 
    backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#ffffff' 
  }), [colorScheme]);

  useEffect(() => {
    const subscription = subscribeToForegroundNotifications();
    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={bgStyle}>
      <SafeAreaProvider>
        <ThemeProvider value={theme}>
          <AppQueryProvider>
            <AuthProvider>
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
              <Toaster />
              <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
          </AppQueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
