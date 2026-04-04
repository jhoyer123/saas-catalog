import {
  getPublicProductBySlug,
  getPublicStore,
} from "@/lib/actions/catalogActions";
import ProductDetailClient from "@/components/catalog/products/ProductDetailClient";
import { notFound } from "next/navigation";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";

type Props = {
  params: Promise<{ store_slug: string; slug: string }>;
};

export const revalidate = false; // 1 año en segundos
export const dynamic = "force-static";

export default async function Page({ params }: Props) {
  const { store_slug, slug } = await params;

  const product = await getPublicProductBySlug(store_slug, slug).catch(
    () => null,
  );

  if (!product) notFound();

  // Inyecta en TanStack para que back-navigation sea instantáneo
  const queryClient = new QueryClient();
  queryClient.setQueryData(["public-product", store_slug, slug], product);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailClient slugProd={product.slug} storeSlug={store_slug} />
    </HydrationBoundary>
  );
}
