import { CategoriesTable } from "@/components/categories/table/CategoriesTable";

/**
 * Página de categorías.
 * CategoriesTable es self-contained: maneja su propio estado de modales
 * (igual que ProductsTable), incluyendo el botón de agregar.
 */
export default function DashboardPage() {
  return (
    <section className="p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <CategoriesTable />
      </div>
    </section>
  );
}
