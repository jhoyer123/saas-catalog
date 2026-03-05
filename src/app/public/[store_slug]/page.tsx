import {
  getPublicProducts,
  getPublicCategories,
  getPublicBrands,
  getPublicBanners,
} from "@/lib/actions/catalogActions";
import CatalogClient from "@/components/catalog/CatalogClient";

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

  const [{ products, totalPages, total }, categories, brands, banners] =
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
        page: Number(page) || 1,
      }),
      getPublicCategories(store_slug),
      getPublicBrands(store_slug),
      getPublicBanners(store_slug),
    ]);

  return (
    <CatalogClient
      products={products}
      totalPages={totalPages}
      total={total}
      categories={categories}
      brands={brands}
      banners={banners}
    />
  );
}
