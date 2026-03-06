import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import StoreInactive from "@/components/dashboard/StoreInactive";
import { getSessionDataCached } from "@/lib/helpers/session";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener sesión completa en servidor — misma data que useSessionData necesita
  const sessionData = await getSessionDataCached();

  if (!sessionData) return null; // middleware ya redirige, pero por seguridad

  // Bloquear si la tienda está inactiva
  if (sessionData.store && !sessionData.store.is_active) {
    return <StoreInactive />;
  }

  // Inyectar en TanStack: el cliente encuentra ["session-data"] en cache de inmediato
  const queryClient = new QueryClient();
  queryClient.setQueryData(["session-data"], sessionData);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider>
        <AppSidebar />
        <main className="h-full w-full">
          <div className="p-3 border-b">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </SidebarProvider>
    </HydrationBoundary>
  );
}
