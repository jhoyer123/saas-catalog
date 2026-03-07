"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

/**
 * NavProjects — Menú lateral de navegación del dashboard.
 *
 * Props:
 *  - projects: lista de items del menú con nombre, url, ícono
 *    y opcionalmente `requiresStore` para indicar que necesitan tienda.
 *  - hasStore: indica si el usuario ya creó su tienda.
 *
 * Si un item tiene `requiresStore: true` y `hasStore` es false,
 * el link se renderiza deshabilitado (sin navegación, con opacidad reducida
 * y un tooltip informativo).
 */
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
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Menú</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          // Si el item requiere tienda y no hay tienda → deshabilitado
          const disabled = item.requiresStore && !hasStore;

          return (
            <SidebarMenuItem key={item.name}>
              {disabled ? (
                // ── Item deshabilitado ──
                // Se muestra pero no navega; indica visualmente que falta la tienda
                <SidebarMenuButton
                  disabled
                  tooltip="Primero crea tu tienda"
                  className="opacity-40 cursor-not-allowed"
                >
                  <item.icon />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              ) : (
                // ── Item normal con navegación ──
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
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
