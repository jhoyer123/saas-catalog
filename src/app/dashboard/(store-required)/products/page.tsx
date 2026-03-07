import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductsTable } from "@/components/products/table/ProductsTable";

export default function DashboardPage() {
  return (
    <section className="p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Lista de Productos
            </h1>
            <p className="text-muted-foreground">
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
