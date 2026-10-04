"use client";

import Form from "@/components/products/form/Form";
import { Button } from "@/components/ui/button";
import { useGetBrandsNoPage } from "@/hooks/brand/useGetBrandsNoPage";
import { useGetCategoryNoPage } from "@/hooks/category/useGetCategoryNoPage";
import Link from "next/link";
import { useSessionData } from "@/hooks/auth/useSessionData";
import { useOptionTypesForProduct } from "@/features/product/product-variants/hooks/useOptionTypesAndValues";
import { useHandleProduct } from "@/hooks/products/useHandleProduct";
import SkeletonForm from "@/components/shared/SkeletonForm";

export default function Page() {
  const { data: DataPlan, isLoading: isLoadingPlan } = useSessionData();
  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategoryNoPage();
  const { data: brands, isLoading: isLoadingBrands } = useGetBrandsNoPage();
  const { data: storeOptionTypes, isLoading: isLoadingStoreOptionTypes } =
    useOptionTypesForProduct();

  const { isPending } = useHandleProduct();

  if (
    isLoadingCategories ||
    isLoadingBrands ||
    isLoadingPlan ||
    isLoadingStoreOptionTypes ||
    !storeOptionTypes ||
    !categories ||
    !brands ||
    !DataPlan?.plan
  ) {
    return <SkeletonForm />;
  }

  return (
    <div className="h-full w-full p-4">
      <div className="mx-auto flex w-full flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:justify-between items-start gap-3">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight md:text-2xl font-poppins">
              Crear producto
            </h2>
            <p className="text-sm text-muted-foreground font-inter lg:text-md">
              Completa la información y las características del producto.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
            <Button variant="outline" asChild className="w-full lg:w-auto">
              <Link href="/dashboard/products">
                Cancelar y volver a productos
              </Link>
            </Button>
            <Button
              variant="default"
              type="submit"
              form="product-form"
              disabled={isPending}
              className="w-full lg:w-auto"
            >
              Crear producto
            </Button>
          </div>
        </div>
        <Form
          mode="create"
          categories={categories || []}
          brands={brands || []}
          plan={DataPlan.plan}
          storeOptionTypes={storeOptionTypes || []}
        />
      </div>
    </div>
  );
}
