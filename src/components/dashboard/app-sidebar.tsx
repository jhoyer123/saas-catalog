"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavUser } from "../sidebar/nav-user";
import HeaderSidebar from "../sidebar/HeaderSidebar";
import { NavProjects } from "../sidebar/nav-projects";
import { Frame, Layers, LucideIcon, Package, Store } from "lucide-react";
import { useSessionData } from "@/hooks/auth/useSessionData";
import SkeletonSidebar from "./SkeletonSidebar";

interface Data {
  user: { full_name: string; email: string; avatar: string };
  projects: { name: string; url: string; icon: LucideIcon }[];
}

const data: Data = {
  user: {
    full_name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  projects: [
    { name: "Dashboard", url: "/dashboard/panel", icon: Frame },
    { name: "Categorias", url: "/dashboard/categories", icon: Layers },
    { name: "Productos", url: "/dashboard/products", icon: Package },
    { name: "Mi Tienda", url: "/dashboard/store", icon: Store },
  ],
};

export function AppSidebar() {
  const { data: user, isPending } = useSessionData();

  if (isPending) {
    return <SkeletonSidebar />;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <HeaderSidebar />
      </SidebarHeader>
      <SidebarContent>
        <SidebarContent>
          <NavProjects projects={data.projects} />
        </SidebarContent>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user?.profile || data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
