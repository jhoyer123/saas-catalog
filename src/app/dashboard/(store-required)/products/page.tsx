import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductsTable } from "@/components/products/table/ProductsTable";

export default function DashboardPage() {
  return (
    <section className="p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl font-poppins">
              Lista de Productos
            </h1>
            <p className="text-sm text-muted-foreground font-inter lg:text-md">
              Gestiona y administra tu catálogo de productos
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/products/new">Agregar producto</Link>
          </Button>
        </div>

        <ProductsTable />
      </div>
    </section>
  );
}
