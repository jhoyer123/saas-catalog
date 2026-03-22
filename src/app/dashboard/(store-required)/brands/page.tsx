import { BrandsTable } from "@/components/brands/table/BrandsTable";

/**
 * Página de categorías.
 * CategoriesTable es self-contained: maneja su propio estado de modales
 * (igual que ProductsTable), incluyendo el botón de agregar.
 */
export default function DashboardPage() {
  return (
    <section className="p-4 w-full max-w-full">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <BrandsTable />
      </div>
    </section>
  );
}
