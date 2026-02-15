import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>Dashboard</SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>Footer</SidebarFooter>
    </Sidebar>
  );
}
