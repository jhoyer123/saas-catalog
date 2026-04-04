import {
  getPublicProductsInitial,
  getPublicCategories,
  getPublicBrands,
  getPublicBanners,
  getPublicStore,
} from "@/lib/actions/catalogActions";
import CatalogClient from "@/components/catalog/CatalogClient";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { Suspense } from "react";

type Props = {
  params: Promise<{ store_slug: string }>;
};

export const revalidate = false; // 1 año en segundos
export const dynamic = "force-static";

export default async function Page({ params }: Props) {
  const { store_slug } = await params;
  const store = await getPublicStore(store_slug);

  const [initialProductData, categories, brands, banners] = await Promise.all([
    getPublicProductsInitial(store_slug, store.id),
    getPublicCategories(store_slug, store.id),
    getPublicBrands(store_slug, store.id),
    getPublicBanners(store_slug, store.id),
  ]);

  const queryClient = new QueryClient();

  const productKey = [
    "public-products",
    store_slug,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    1,
  ];
  const storeKey = ["public-store", store_slug]; // <-- Clave para el store

  // Inyecta en TanStack para que back-navigation sea instantáneo
  queryClient.setQueryData(productKey, initialProductData);
  queryClient.setQueryData(storeKey, store);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-catalog-primary text-catalog-secondary text-md font-medium">
            Cargando catálogo...
          </div>
        }
      >
        <CatalogClient
          categories={categories}
          brands={brands}
          banners={banners}
          store={store}
        />
      </Suspense>
    </HydrationBoundary>
  );
}
