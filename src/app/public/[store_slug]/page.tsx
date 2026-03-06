import {
  getPublicProducts,
  getPublicCategories,
  getPublicBrands,
  getPublicBanners,
  getPublicStore,
} from "@/lib/actions/catalogActions";
import CatalogClient from "@/components/catalog/CatalogClient";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";

type SearchParams = {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  onlyOffers?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "display_order";
  page?: string;
};

type Props = {
  params: Promise<{ store_slug: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function Page({ params, searchParams }: Props) {
  const { store_slug } = await params;
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    onlyOffers,
    sort,
    page,
  } = await searchParams;

  const queryClient = new QueryClient();
  const pageNum = Number(page) || 1;
  const productKey = [
    "public-products",
    store_slug,
    search ?? "",
    category ?? "",
    brand ?? "",
    minPrice ?? "",
    maxPrice ?? "",
    onlyOffers ?? "",
    sort ?? "",
    pageNum,
  ];

  const [initialProductData, categories, brands, banners, store] =
    await Promise.all([
      getPublicProducts({
        storeSlug: store_slug,
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        onlyOffers,
        sort,
        page: pageNum,
      }),
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
