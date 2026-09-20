"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavProjects({
  projects,
  hasStore,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
    requiresStore?: boolean;
  }[];
  hasStore: boolean;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Menú</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const disabled = item.requiresStore && !hasStore;

          const isActive =
            pathname === item.url ||
            pathname.startsWith(`${item.url}/`) ||
            (pathname === "/dashboard" && item.url === "/dashboard/panel");

          return (
            <SidebarMenuItem key={item.name}>
              {disabled ? (
                <SidebarMenuButton
                  disabled
                  tooltip="Primero crea tu tienda"
                  className="opacity-40 cursor-not-allowed"
                >
                  <item.icon />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.url} prefetch={false}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
