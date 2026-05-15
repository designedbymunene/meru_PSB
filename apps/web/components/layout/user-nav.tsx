"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthContext } from "@/hooks/use-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { ChevronRight, LogOut, Settings, User as UserIcon, ChevronsUpDown } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

export function UserNav({ showDetails = false, className }: { showDetails?: boolean; className?: string }) {
    const { user, logout } = useAuthContext()
    const router = useRouter()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    if (!user) {
        return (
            <Button variant="outline" className={cn("w-full h-11 rounded-xl", className)} onClick={() => router.push("/login")}>
                Login
            </Button>
        )
    }

    const initials = user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {showDetails ? (
                    <Button 
                        variant="ghost" 
                        className={cn(
                            "relative flex items-center justify-between w-full rounded-xl transition-all duration-200",
                            isCollapsed ? "h-10 w-10 p-0 justify-center" : "h-14 px-3 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900",
                            className
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800 shrink-0">
                                <AvatarImage src="/avatars/01.png" alt={user.fullName} />
                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <div className="flex flex-col items-start truncate max-w-[120px]">
                                    <p className="text-[13px] font-bold leading-none text-slate-900 dark:text-white truncate w-full">{user.fullName}</p>
                                    <p className="text-[11px] leading-none text-muted-foreground mt-1 truncate w-full">
                                        {user.email}
                                    </p>
                                </div>
                            )}
                        </div>
                        {!isCollapsed && <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400 shrink-0" />}
                    </Button>
                ) : (
                    <Button variant="ghost" className={cn("relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary/20", className)}>
                        <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-950 shadow-sm">
                            <AvatarImage src="/avatars/01.png" alt={user.fullName} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{initials}</AvatarFallback>
                        </Avatar>
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                className={cn(
                    "rounded-2xl border-slate-200/60 dark:border-slate-800/60 p-2 shadow-2xl", 
                    showDetails && !isCollapsed ? "w-[var(--radix-dropdown-menu-trigger-width)]" : "w-64"
                )} 
                align={showDetails && !isCollapsed ? "center" : "end"} 
                side={showDetails && isCollapsed ? "right" : "bottom"}
                sideOffset={12}
                forceMount
            >
                {(!showDetails || isCollapsed) && (
                    <>
                        <DropdownMenuLabel className="font-normal p-4">
                            <div className="flex flex-col space-y-1.5">
                                <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">{user.fullName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/60" />
                    </>
                )}
                <DropdownMenuGroup className="space-y-1">
                    <Link href="/dashboard/profile">
                        <DropdownMenuItem className="h-10 rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary">
                            <UserIcon className="mr-2 h-4 w-4 opacity-60" />
                            <span className="font-medium">My Profile</span>
                            <DropdownMenuShortcut className="text-[10px] opacity-40 font-bold uppercase tracking-widest ml-auto">⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem asChild className="h-10 rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary">
                        <Link href="/dashboard/settings" className="flex items-center w-full">
                            <Settings className="mr-2 h-4 w-4 opacity-60" />
                            <span className="font-medium">Settings</span>
                            <DropdownMenuShortcut className="text-[10px] opacity-40 font-bold uppercase tracking-widest ml-auto">⌘S</DropdownMenuShortcut>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/60" />
                <DropdownMenuItem 
                    onClick={() => logout()}
                    className="h-10 rounded-xl cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive"
                >
                    <LogOut className="mr-2 h-4 w-4 opacity-60" />
                    <span className="font-medium">Log out</span>
                    <DropdownMenuShortcut className="text-[10px] opacity-40 font-bold uppercase tracking-widest ml-auto">⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
