"use client";

import Form from "@/components/products/form/Form";
import SkeletonForm from "@/components/shared/SkeletonForm";
import { Button } from "@/components/ui/button";
import { useGetBrandsNoPage } from "@/hooks/brand/useGetBrandsNoPage";
import { useGetCategoryNoPage } from "@/hooks/category/useGetCategoryNoPage";
import { useGetProductById } from "@/hooks/products/useGetProductById";
import Link from "next/link";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: product, isLoading: isLoadingProduct } = useGetProductById(id);
  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategoryNoPage();
  const { data: brands, isLoading: isLoadingBrands } = useGetBrandsNoPage();
  if (
    isLoadingProduct ||
    isLoadingCategories ||
    isLoadingBrands ||
    !product ||
    !categories ||
    !brands
  ) {
    return <SkeletonForm />;
  }

  return (
    <div className="h-full w-full py-6 px-4">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-poppins">Detalles del producto</h1>
          <Button variant="default" asChild>
            <Link href="/dashboard/products">Volver</Link>
          </Button>
        </div>
        <Form
          mode="view"
          initialData={product}
          categories={categories ?? []}
          //isLoadingCategories={isLoadingCategories}
          brands={brands ?? []}
          //isLoadingBrands={isLoadingBrands}
          //isLoadingProduct={isLoadingProduct}
        />
      </div>
    </div>
  );
}
