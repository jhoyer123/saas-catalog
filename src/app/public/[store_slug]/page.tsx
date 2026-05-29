import {
  getPublicProductsInitial,
  getPublicCategories,
  getPublicBrands,
  getPublicBanners,
  getPublicStore,
} from "@/lib/actions/catalogActions";
import CatalogClient from "@/components/catalog/CatalogClient";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
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
  const brandsKey = ["public-brands", store_slug]; // <-- Clave para las marcas

  // Inyecta en TanStack para que back-navigation sea instantáneo
  queryClient.setQueryData(productKey, initialProductData);
  queryClient.setQueryData(storeKey, store);
  queryClient.setQueryData(brandsKey, brands);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Server-rendered LCP image: visible in initial HTML for LCP detection. */}
      {banners && banners.length > 0 && (
        <div id="hero-lcp-wrapper" style={{ width: "100%" }}>
          <img
            id="hero-lcp"
            src={getCatalogImageUrl(banners[0].image_url)}
            alt={"Banner"}
            loading="eager"
            fetchPriority="high"
            width={1280}
            height={720}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      )}
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
