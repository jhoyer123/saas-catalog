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

type Props = {
  params: Promise<{ store_slug: string }>;
};

export const revalidate = false;

export default async function Page({ params }: Props) {
  const { store_slug } = await params;
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

  const [initialProductData, categories, brands, banners, store] =
    await Promise.all([
      getPublicProductsInitial(store_slug),
      getPublicCategories(store_slug),
      getPublicBrands(store_slug),
      getPublicBanners(store_slug),
      getPublicStore(store_slug),
    ]);

  // Inyecta en TanStack para que back-navigation sea instantáneo
  queryClient.setQueryData(productKey, initialProductData);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CatalogClient
        initialProductData={initialProductData}
        categories={categories}
        brands={brands}
        banners={banners}
        store={store}
      />
    </HydrationBoundary>
  );
}
