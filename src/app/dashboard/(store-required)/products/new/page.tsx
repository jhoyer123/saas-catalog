"use client";

import Form from "@/components/products/form/Form";
import { Button } from "@/components/ui/button";
import { useGetBrandsNoPage } from "@/hooks/brand/useGetBrandsNoPage";
import { useGetCategoryNoPage } from "@/hooks/category/useGetCategoryNoPage";
import Link from "next/link";
import SkeletonForm from "../[id]/view/loading";
import { useSessionData } from "@/hooks/auth/useSessionData";
import { useOptionTypesForProduct } from "@/features/product/product-variants/hooks/useOptionTypesAndValues";

export default function Page() {
  const { data: DataPlan, isLoading: isLoadingPlan } = useSessionData();
  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategoryNoPage();
  const { data: brands, isLoading: isLoadingBrands } = useGetBrandsNoPage();
  const { data: storeOptionTypes, isLoading: isLoadingStoreOptionTypes } =
    useOptionTypesForProduct();

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
    <div className="h-full w-full py-6 px-4">
      <div className="w-full mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-4 items-center justify-between lg:flex-row mb-4">
          <h1 className="font-poppins text-xl md:text-2xl">
            Crear nuevo producto
          </h1>
          <div className="flex gap-5">
            <Button variant="secondary" asChild>
              <Link href="/dashboard/products">Cancelar y volver</Link>
            </Button>
            <Button variant="default" type="submit" form="product-form">
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
