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

export const revalidate = 31536000; // 1 año en segundos

export default async function Page({ params }: Props) {
  const { store_slug, slug } = await params;

  const [product, store] = await Promise.all([
    getPublicProductBySlug(store_slug, slug).catch(() => null),
    getPublicStore(store_slug),
  ]);

  if (!product) notFound();

  // Inyecta en TanStack para que back-navigation sea instantáneo
  const queryClient = new QueryClient();
  //queryClient.setQueryData(["public-product", slug], product);
  queryClient.setQueryData(["public-product", store_slug, slug], product);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailClient
        product={product}
        storeSlug={store_slug}
        store={store}
      />
    </HydrationBoundary>
  );
}
