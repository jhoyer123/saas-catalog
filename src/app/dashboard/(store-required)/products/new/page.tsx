"use client";

import Form from "@/components/products/form/Form";
import { Button } from "@/components/ui/button";
import { useGetBrandsNoPage } from "@/hooks/brand/useGetBrandsNoPage";
import { useGetCategoryNoPage } from "@/hooks/category/useGetCategoryNoPage";
import Link from "next/link";
import SkeletonForm from "../[id]/view/loading";
import { useSessionData } from "@/hooks/auth/useSessionData";
import { useOptionTypesForProduct } from "@/features/product/product-variants/hooks/useOptionTypesAndValues";
import { useHandleProduct } from "@/hooks/products/useHandleProduct";

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
      <div className="mx-auto flex w-full flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Crear producto
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Completa la información y las características del producto para
              agregarlo a tu catálogo.
            </p>
          </div>
          <div className="flex gap-5">
            <Button variant="outline" asChild>
              <Link href="/dashboard/products">Cancelar y volver a productos</Link>
            </Button>
            <Button
              variant="default"
              type="submit"
              form="product-form"
              disabled={isPending}
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
