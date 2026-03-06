// src/app/public/[storeSlug]/[productSlug]/page.tsx
import { getPublicProductBySlug, getPublicStore } from "@/lib/actions/catalogActions";
import ProductDetailClient from "@/components/catalog/products/ProductDetailClient";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type Props = {
  params: Promise<{ store_slug: string; slug: string }>;
};

export default async function Page({ params }: Props) {
  const { store_slug, slug } = await params;

  const [product, store] = await Promise.all([
    getPublicProductBySlug(slug).catch(() => null),
    getPublicStore(store_slug),
  ]);

  if (!product) notFound();

  return <ProductDetailClient product={product} storeSlug={store_slug} store={store} />;
}
