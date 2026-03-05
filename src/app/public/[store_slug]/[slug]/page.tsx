// src/app/public/[storeSlug]/[productSlug]/page.tsx
import { getPublicProductBySlug } from "@/lib/actions/catalogActions";
import ProductDetailClient from "@/components/catalog/products/ProductDetailClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ store_slug: string; slug: string }>;
};

export default async function Page({ params }: Props) {
  const { store_slug, slug } = await params;

  const product = await getPublicProductBySlug(slug).catch(() => null);

  if (!product) notFound();

  return <ProductDetailClient product={product} storeSlug={store_slug} />;
}
