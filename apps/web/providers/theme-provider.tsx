"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  try {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
  } catch (error) {
    console.error("Theme provider error, falling back to light theme:", error)
    return <>{children}</>
  }
}
