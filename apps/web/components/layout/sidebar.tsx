import * as React from "react"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Database,
  Building2,
  Network,
  Users,
} from "lucide-react"
import { Logo } from "@/components/shared/logo"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Admin navigation data
const data = {
  navMain: [
    {
      title: "Overview",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true,
      items: [],
    },
    {
      title: "Vacancies",
      url: "/admin/vacancies",
      icon: Briefcase,
      items: [],
    },
    {
      title: "Applications",
      url: "/admin/applications",
      icon: FileText,
      items: [],
    },
    {
      title: "Reference Data",
      url: "#",
      icon: Database,
      items: [

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
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Logo size="sm" variant="icon" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Meru Portal</span>
                  <span className="">Admin Panel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                  <a href={item.url} className="font-medium">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
