"use client";

import Form from "@/components/products/form/Form";
import { Button } from "@/components/ui/button";
import { useGetBrandsNoPage } from "@/hooks/brand/useGetBrandsNoPage";
import { useGetCategoryNoPage } from "@/hooks/category/useGetCategoryNoPage";
import Link from "next/link";
import SkeletonForm from "../[id]/view/loading";
import { useSessionData } from "@/hooks/auth/useSessionData";

export default function Page() {
  //get categories for select in form
  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategoryNoPage();
  const { data: brands, isLoading: isLoadingBrands } = useGetBrandsNoPage();

  //data plan for form
  const { data: DataPlan, isLoading: isLoadingPlan } = useSessionData();

  if (
    isLoadingCategories ||
    isLoadingBrands ||
    isLoadingPlan ||
    !categories ||
    !brands ||
    !DataPlan?.plan
  ) {
    return <SkeletonForm />;
  }

  return (
    <div className="h-full w-full py-6 px-4">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
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
        />
      </div>
    </div>
  );
}
