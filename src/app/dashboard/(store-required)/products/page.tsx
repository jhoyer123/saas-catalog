import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductsTable } from "@/components/products/table/ProductsTable";

export default function DashboardPage() {
  return (
    <section className="p-4">
      <div className="mx-auto">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row mb-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight md:text-2xl font-poppins">
              Lista de Productos
            </h2>
            <p className="text-sm text-muted-foreground font-inter lg:text-md">
              Gestiona y administra tu catálogo de productos.
            </p>
          </div>
          <Button className="w-full lg:w-auto" asChild>
            <Link href="/dashboard/products/new">Agregar producto</Link>
          </Button>
        </div>

        <ProductsTable />
      </div>
    </section>
  );
}
