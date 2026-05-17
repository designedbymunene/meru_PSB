"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Network,
  Users,
  UserCircle,
  LifeBuoy,
  Settings,
  Filter,
  Scale,
  BarChart3,
  Download,
} from "lucide-react"
import { Logo } from "@/components/shared/logo"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { UserNav } from "./user-nav"

// Admin navigation data
const navData = {
  main: [
    {
      title: "Overview",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Vacancies",
      url: "/admin/vacancies",
      icon: Briefcase,
    },
    {
      title: "Applications",
      url: "/admin/applications",
      icon: FileText,
    },
    {
      title: "Applicant Profiles",
      url: "/admin/profiles",
      icon: UserCircle,
    },
    {
      title: "Shortlisting",
      url: "/admin/shortlisting",
      icon: Filter,
    },
    {
      title: "Interviews",
      url: "/admin/interviews",
      icon: Users,
    },
  ],
  governance: [
    {
      title: "Board",
      url: "/admin/board",
      icon: Scale,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: BarChart3,
    },
  ],
  configuration: [
    {
      title: "Downloads",
      url: "/admin/downloads",
      icon: Download,
    },
    {
      title: "Departments",
      url: "/admin/departments",
      icon: Network,
    },
    {
      title: "Job Groups",
      url: "/admin/job-groups",
      icon: Users,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <Logo size="md" variant="icon" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Meru Portal</span>
                  <span className="text-xs text-muted-foreground">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {navData.main.map((item) => {
              const isActive = pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url))
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Governance</SidebarGroupLabel>
          <SidebarMenu>
            {navData.governance.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url)
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarMenu>
            {navData.configuration.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url)
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Support">
                <Link href="/admin/support">
                  <LifeBuoy />
                  <span>Support</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/admin/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UserNav showDetails className="border-none hover:bg-transparent px-2" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
