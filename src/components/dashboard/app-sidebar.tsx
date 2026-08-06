"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "../sidebar/nav-user";
import HeaderSidebar from "../sidebar/HeaderSidebar";
import { NavProjects } from "../sidebar/nav-projects";
import {
  BadgeCheck,
  BadgeDollarSign,
  Frame,
  Layers,
  LucideIcon,
  Package,
  SlidersHorizontal,
  Store,
  X,
} from "lucide-react";
import { useSessionData } from "@/hooks/auth/useSessionData";
import SkeletonSidebar from "./SkeletonSidebar";
import { NavSecondary } from "../sidebar/nav-secondary";
import { Button } from "../ui/button";

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
  {
    name: "Atributos",
    url: "/dashboard/options",
    icon: SlidersHorizontal,
    requiresStore: true,
  },
  {
    name: "Categorias",
    url: "/dashboard/categories",
    icon: Layers,
    requiresStore: true,
  },
  {
    name: "Marcas",
    url: "/dashboard/brands",
    icon: BadgeCheck,
    requiresStore: true,
  },
  {
    name: "Productos",
    url: "/dashboard/products",
    icon: Package,
    requiresStore: true,
  },
  { name: "Mi Tienda", url: "/dashboard/store", icon: Store },
  //{ name: "Configuración", url: "/dashboard/settings", icon: Settings },
];

const navSecondaryItems: NavItem[] = [
  { name: "Planes", url: "/dashboard/plans", icon: BadgeDollarSign },
];

export function AppSidebar() {
  const { data: session, isPending } = useSessionData();

  const { isMobile, setOpenMobile } = useSidebar();

  if (isPending) {
    return <SkeletonSidebar />;
  }

  // hasStore viene de la sesión hidratada por el layout del servidor
  const hasStore = session?.hasStore ?? false;

  return (
    <Sidebar>
      <SidebarHeader>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenMobile(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        <HeaderSidebar />
      </SidebarHeader>
      <SidebarContent>
        <SidebarContent>
          <NavProjects projects={navItems} hasStore={hasStore} />
          <NavSecondary items={navSecondaryItems} className="mt-auto" />
        </SidebarContent>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={session?.profile || { full_name: "", email: "", avatar: "" }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
