"use client"; // ← Agrega esta línea al inicio

import Form from "@/components/products/form/Form";
import { Button } from "@/components/ui/button";
import { useGetCategoryNoPage } from "@/hooks/category/useGetCategoryNoPage";
import Link from "next/link";

export default function Page() {
  //get categories for select in form
  const { data: categories } = useGetCategoryNoPage();

  return (
    <div className="h-full w-full py-6 px-4">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1>Crear nuevo producto</h1>
          <div className="flex gap-5">
            <Button variant="secondary" asChild>
              <Link href="/dashboard/products">Cancelar y volver</Link>
            </Button>
            <Button variant="default" type="submit" form="product-form">
              Crear producto
            </Button>
          </div>
        </div>
        <Form mode="create" categories={categories || []} />
      </div>
    </div>
  );
}
