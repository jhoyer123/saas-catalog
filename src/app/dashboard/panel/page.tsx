import { getProductCount } from "@/lib/actions/validateActions";
import { getSessionDataCached } from "@/lib/helpers/session";
import PanelPage from "@/components/panel/PanelPage";

export default async function Page() {
  // React.cache() deduplicates: getSessionDataCached ya fue llamado en el layout
  // dentro del mismo ciclo de render — Supabase no se consulta dos veces
  const [count, sessionData] = await Promise.all([
    getProductCount(),
    getSessionDataCached(),
  ]);

  return (
    <PanelPage hasProducts={count > 0} store={sessionData?.store ?? null} />
  );
}
