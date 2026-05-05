import { Stack } from "expo-router";
import "../global.css";
import { AuthProvider } from "../context/auth-context";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppQueryProvider } from "@/lib/query/provider";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useMemo } from "react";

// Custom themes to match our Digital CV aesthetic
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
    primary: '#60a5fa',
    background: '#030712', // gray-950
    card: '#030712',
    border: '#1e293b',
    text: '#ffffff',
  },
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  
  const theme = useMemo(() => 
    colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme, 
  [colorScheme]);

  const bgStyle = useMemo(() => ({ 
    flex: 1, 
    backgroundColor: colorScheme === 'dark' ? '#030712' : '#ffffff' 
  }), [colorScheme]);

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
