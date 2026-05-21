"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const renderIcon = () => {
        if (!mounted) {
            return <Sun className="h-5 w-5" />
        }
        if (theme === "system") {
            return <Monitor className="h-5 w-5" />
        }
        if (theme === "dark") {
            return <Moon className="h-5 w-5" />
        }
        return <Sun className="h-5 w-5" />
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900">
                    {renderIcon()}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800">
                <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-xl flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-xl flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-xl flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function ThemeToggleRow() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-1 rounded-xl">
                <div className="h-8 w-8 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-850" />
                <div className="h-8 w-8 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-850" />
                <div className="h-8 w-8 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-850" />
            </div>
        )
    }

    const themes = [
        { id: "light", icon: Sun, label: "Light" },
        { id: "dark", icon: Moon, label: "Dark" },
        { id: "system", icon: Monitor, label: "System" },
    ]

    return (
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-1 rounded-xl">
            {themes.map(({ id, icon: Icon, label }) => {
                const isActive = theme === id
                return (
                    <Button
                        key={id}
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(id)}
                        className={cn(
                            "h-8 w-8 rounded-lg transition-all duration-200",
                            isActive 
                                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" 
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
                        )}
                        title={label}
                        aria-label={`Switch to ${label} theme`}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                )
            })}
        </div>
    )
}

