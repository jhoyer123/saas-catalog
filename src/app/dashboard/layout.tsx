import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import BfcacheGuard from "@/components/auth/BfcacheGuard";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { PlanBadge } from "@/components/plans/PlanBadge";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BfcacheGuard />
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col h-full w-full min-h-screen">
          <div className="p-3 border-b flex items-center justify-between">
            <SidebarTrigger />
            <PlanBadge />
          </div>
          <DashboardGuard>{children}</DashboardGuard>
        </main>
      </SidebarProvider>
    </>
  );
}
