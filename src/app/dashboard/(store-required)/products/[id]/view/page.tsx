"use client";

import Form from "@/components/products/form/Form";
import SkeletonForm from "@/components/shared/SkeletonForm";
import { Button } from "@/components/ui/button";
import { useSessionData } from "@/hooks/auth/useSessionData";
import { useGetBrandsNoPage } from "@/hooks/brand/useGetBrandsNoPage";
import { useGetCategoryNoPage } from "@/hooks/category/useGetCategoryNoPage";
import { useGetProductById } from "@/hooks/products/useGetProductById";
import { useOptionTypesForProduct } from "@/features/product/product-variants/hooks/useOptionTypesAndValues";
import Link from "next/link";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: product, isLoading: isLoadingProduct } = useGetProductById(id);
  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategoryNoPage();
  const { data: brands, isLoading: isLoadingBrands } = useGetBrandsNoPage();
  const { data: storeOptionTypes, isLoading: isLoadingStoreOptionTypes } =
    useOptionTypesForProduct();
  const { data: DataPlan, isLoading: isLoadingPlan } = useSessionData();

  if (
    isLoadingProduct ||
    isLoadingCategories ||
    isLoadingBrands ||
    isLoadingStoreOptionTypes ||
    isLoadingPlan ||
    !product ||
    !categories ||
    !brands ||
    !storeOptionTypes ||
    !DataPlan?.plan
  ) {
    return <SkeletonForm />;
  }

  return (
    <div className="h-full w-full py-6 px-4">
      <div className="w-full mx-auto flex flex-col gap-6">
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
          brands={brands ?? []}
          plan={DataPlan.plan}
          storeOptionTypes={storeOptionTypes ?? []}
        />
      </div>
    </div>
  );
}