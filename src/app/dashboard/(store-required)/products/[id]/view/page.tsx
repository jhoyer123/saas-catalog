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
    <div className="h-full w-full p-4">
      <div className="mx-auto flex w-full flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Detalles del producto
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta la información y características de este producto.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href="/dashboard/products">Volver a productos</Link>
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
