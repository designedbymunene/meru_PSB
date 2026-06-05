import React, { createContext, useContext, ReactNode } from 'react';

export interface NavigationTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    border: string;
    text: string;
  };
}

const DefaultTheme: NavigationTheme = {
  dark: false,
  colors: {
    primary: '#004aad',
    background: '#ffffff',
    card: '#ffffff',
    border: '#f1f5f9',
    text: '#0f172a',
  },
};

const DarkTheme: NavigationTheme = {
  dark: true,
  colors: {
    primary: '#3b82f6',
    background: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    text: '#f8fafc',
  },
};

const CustomDefaultTheme: NavigationTheme = {
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

const CustomDarkTheme: NavigationTheme = {
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

interface ThemeContextValue {
  theme: NavigationTheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  isDark: boolean;
}

export function ThemeProvider({ children, isDark }: ThemeProviderProps) {
  const theme = isDark ? CustomDarkTheme : CustomDefaultTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
