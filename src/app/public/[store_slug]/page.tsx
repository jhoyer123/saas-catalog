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
import { Suspense, useEffect, useState } from "react";
import { checkIsPlanActive } from "@/lib/helpers/validations";
import CatalogNotAvailable from "@/components/catalog/CatalogNotAvailable";

type Props = {
  params: Promise<{ store_slug: string }>;
};

export const revalidate = false;
export const dynamic = "force-static";

export default async function Page({ params }: Props) {
  const { store_slug } = await params;
  const store = await getPublicStore(store_slug);

  /* console.warn("STORE EN PAGE: ", store);
  console.warn(
    "STORE ACTIVO    : ",
    !checkIsPlanActive({
      is_active: store.is_active,
      plan_expires_at: store.plan_expires_at,
    }),
  );
  if (
    !checkIsPlanActive({
      is_active: store.is_active,
      plan_expires_at: store.plan_expires_at,
    })
  ) {
    return <CatalogNotAvailable handle={store.slug} />;
  } */
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!checkIsPlanActive(store)) {
      setIsBlocked(true);
    }
  }, [store]);

  if (isBlocked) {
    return <CatalogNotAvailable handle={store.slug} />;
  }

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
  const brandsKey = ["public-brands", store_slug]; // <-- Clave para las marcas

  // Inyecta en TanStack para que back-navigation sea instantáneo
  queryClient.setQueryData(productKey, initialProductData);
  queryClient.setQueryData(storeKey, store);
  queryClient.setQueryData(brandsKey, brands);

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
