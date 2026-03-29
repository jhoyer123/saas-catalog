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

export const revalidate = false;

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

  // Inyecta en TanStack para que back-navigation sea instantáneo
  queryClient.setQueryData(productKey, initialProductData);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Cargando catálogo...
          </div>
        }
      >
        <CatalogClient
          initialProductData={initialProductData}
          categories={categories}
          brands={brands}
          banners={banners}
          store={store}
        />
      </Suspense>
    </HydrationBoundary>
  );
}
