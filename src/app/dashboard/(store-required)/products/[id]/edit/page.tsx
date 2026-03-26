"use client";

import Form from "@/components/products/form/Form";
import SkeletonForm from "@/components/shared/SkeletonForm";
import { Button } from "@/components/ui/button";
import { useSessionData } from "@/hooks/auth/useSessionData";
import { useGetBrandsNoPage } from "@/hooks/brand/useGetBrandsNoPage";
import { useGetCategoryNoPage } from "@/hooks/category/useGetCategoryNoPage";
import { useGetProductById } from "@/hooks/products/useGetProductById";
import Link from "next/link";
import { use, useState } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // Obtener el ID del producto desde los parámetros de la URL y cargar los datos necesarios
  const { id } = use(params);
  const { data: product, isLoading: isLoadingProduct } = useGetProductById(id);
  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategoryNoPage();
  const { data: brands, isLoading: isLoadingBrands } = useGetBrandsNoPage();

  //data plan for form
  const { data: DataPlan, isLoading: isLoadingPlan } = useSessionData();

  // Solo se habilita el boton si cambian los datos
  const [isDirty, setIsDirty] = useState(false);

  if (
    isLoadingProduct ||
    isLoadingCategories ||
    isLoadingBrands ||
    isLoadingPlan ||
    !product ||
    !categories ||
    !brands ||
    !DataPlan?.plan
  ) {
    return <SkeletonForm />;
  }

  return (
    <div className="h-full w-full py-6 px-4">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-4 items-center justify-between  mb-4 lg:flex-row">
          <h1 className="font-poppins text-xl md:text-2xl">Editar producto</h1>

          <div className="flex gap-5">
            <Button variant="secondary" asChild>
              <Link href="/dashboard/products">Volver</Link>
            </Button>
            <Button variant="default" type="submit" form="product-form">
              Guardar cambios
            </Button>
          </div>
        </div>
        <Form
          mode="update"
          initialData={product}
          categories={categories ?? []}
          brands={brands ?? []}
          plan={DataPlan.plan}
          onDirtyChange={setIsDirty}
        />
      </div>
    </div>
  );
}
