"use client";

import Form from "@/components/products/form/Form";
import SkeletonForm from "@/components/shared/SkeletonForm";
import { Button } from "@/components/ui/button";
import { useGetCategoryNoPage } from "@/hooks/category/useGetCategoryNoPage";
import { useGetProductById } from "@/hooks/products/useGetProductById";
import Link from "next/link";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, isLoading: isLoadingProduct } = useGetProductById(id);
  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategoryNoPage();

  if (isLoadingProduct || isLoadingCategories || !product || !categories) {
    return <SkeletonForm />;
  }
  
  return (
    <div className="h-full w-full py-6 px-4">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1>Editar producto</h1>

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
        />
      </div>
    </div>
  );
}
