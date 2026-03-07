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

/**
 * Definición de items del menú lateral.
 *
 * `requiresStore` indica que ese link solo se habilita si el usuario
 * ya creó su tienda. Esto evita que accedan a productos/categorías
 * antes de tener tienda configurada.
 */
interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  /** Si es true, el link se deshabilita cuando no existe tienda */
  requiresStore?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", url: "/dashboard/panel", icon: Frame },
  { name: "Categorias", url: "/dashboard/categories", icon: Layers, requiresStore: true },
  { name: "Productos", url: "/dashboard/products", icon: Package, requiresStore: true },
  { name: "Mi Tienda", url: "/dashboard/store", icon: Store },
];

export function AppSidebar() {
  const { data: session, isPending } = useSessionData();

  if (isPending) {
    return <SkeletonSidebar />;
  }

  // hasStore viene de la sesión hidratada por el layout del servidor
  const hasStore = session?.hasStore ?? false;

  return (
    <Sidebar>
      <SidebarHeader>
        <HeaderSidebar />
      </SidebarHeader>
      <SidebarContent>
        <SidebarContent>
          <NavProjects projects={navItems} hasStore={hasStore} />
        </SidebarContent>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.profile || { full_name: "", email: "", avatar: "" }} />
      </SidebarFooter>
    </Sidebar>
  );
}
