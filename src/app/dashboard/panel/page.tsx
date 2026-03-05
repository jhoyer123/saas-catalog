import { getProductCount } from "@/lib/actions/validateActions";
import PanelPage from "@/components/panel/PanelPage";

export default async function Page() {
  const count = await getProductCount();
  return <PanelPage hasProducts={count > 0} />;
}
