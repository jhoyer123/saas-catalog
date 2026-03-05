import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import StoreInactive from "@/components/dashboard/StoreInactive";
import { createClient } from "@/lib/supabase/supabaseServer";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  //get session data to check if store is active
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // el middleware ya debería manejar esto

  const { data: store } = await supabase
    .from("stores")
    .select("is_active")
    .eq("user_id", user.id)
    .single();

  if (store && !store.is_active) {
    return <StoreInactive />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="h-full w-full">
        <div className="p-3 border-b">
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
