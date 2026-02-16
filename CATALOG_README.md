# Sistema de Catálogo de Productos

## 📁 Estructura de Archivos

### Constants (Datos Mock)
```
src/constants/
  ├── products.mock.ts      # Mock de productos
  └── categories.mock.ts    # Mock de categorías
```

### Components
```
src/components/catalog/
  ├── filter/
  │   ├── FilterPanel.tsx            # Panel de filtros (existente)
  │   └── ProductFilterControls.tsx  # Controles de filtrado
  └── products/
      ├── ProductCard.tsx            # Tarjeta individual de producto
      ├── ProductGrid.tsx            # Grid de productos con loading y empty states
      ├── ProductPagination.tsx      # Controles de paginación
      └── index.ts                   # Exportaciones
```

### Hooks
```
src/hooks/catalog/
  └── useProductFilter.ts    # Hook para filtrado y paginación (CSR)
```

### Pages
```
src/app/public/catalog/
  └── page.tsx              # Página principal del catálogo
```

---

## 🎯 Componentes

### 1. ProductCard
**Ubicación**: `src/components/catalog/products/ProductCard.tsx`

Tarjeta individual de producto que muestra:
- Imagen del producto (con hover effect)
- Badge de "OFERTA" si aplica
- Nombre del producto (truncado a 2 líneas)
- Marca (si existe)
- Precio (con tachado si hay oferta)
- Botones de "Ver Detalles" y "Solicitar"
- Estado de disponibilidad

```tsx
<ProductCard product={productData} />
```

### 2. ProductGrid
**Ubicación**: `src/components/catalog/products/ProductGrid.tsx`

Grid responsive que muestra los productos:
- Layout: 1 columna móvil, 2 tablet, 3 desktop, 4 xl
- Loading states con skeletons
- Empty state cuando no hay productos
- Gap de 6 entre tarjetas

```tsx
<ProductGrid 
  products={filteredProducts}
  isLoading={false}
/>
```

### 3. ProductFilterControls
**Ubicación**: `src/components/catalog/filter/ProductFilterControls.tsx`

Panel lateral con todos los filtros:
- **Búsqueda**: Por nombre, marca o categoría
- **Categoría**: Dropdown con todas las categorías
- **Marca**: Dropdown con marcas disponibles
- **Rango de precio**: Inputs de mín/máx
- **Solo ofertas**: Checkbox
- **Ordenar por**: Dropdown con opciones de ordenamiento
- Botón "Limpiar filtros" (aparece cuando hay filtros activos)

```tsx
<ProductFilterControls
  filters={filters}
  updateFilter={updateFilter}
  resetFilters={resetFilters}
  availableBrands={["Brand1", "Brand2"]}
/>
```

### 4. ProductPagination
**Ubicación**: `src/components/catalog/products/ProductPagination.tsx`

Controles de paginación:
- Botones "Anterior" y "Siguiente"
- Números de página (con elipsis si hay muchas)
- Selector de tamaño de página (8, 12, 24, 48)
- Información de resultados ("Mostrando X a Y de Z")
- Responsive (simplificado en móvil)

```tsx
<ProductPagination
  currentPage={1}
  totalPages={5}
  pageSize={12}
  total={60}
  setPage={setPage}
  setPageSize={setPageSize}
/>
```

---

## 🪝 Hook: useProductFilter

**Ubicación**: `src/hooks/catalog/useProductFilter.ts`

Hook centralizado para manejar todo el filtrado y paginación.

### Parámetros
```tsx
{
  products: ProductCatalog[]  // Array de productos a filtrar
}
```

### Retorna
```tsx
{
  filters: ProductFilters,           // Estado actual de filtros
  updateFilter: Function,            // Actualizar un filtro específico
  resetFilters: Function,            // Resetear todos los filtros
  setPage: Function,                 // Cambiar página
  setPageSize: Function,             // Cambiar tamaño de página
  paginatedResult: {                 // Resultado paginado
    items: ProductCatalog[],         // Productos de la página actual
    total: number,                   // Total de productos filtrados
    totalPages: number,              // Total de páginas
    currentPage: number,             // Página actual
    pageSize: number                 // Tamaño de página
  },
  availableBrands: string[]          // Marcas disponibles
}
```

### Ejemplo de uso
```tsx
const {
  filters,
  updateFilter,
  resetFilters,
  setPage,
  setPageSize,
  paginatedResult,
  availableBrands,
} = useProductFilter({ products: mockProducts });

// Actualizar filtro de búsqueda
updateFilter("search", "camiseta");

// Actualizar filtro de categoría
updateFilter("category", "cat-001");

// Cambiar página
setPage(2);

// Resetear todos los filtros
resetFilters();
```

---

## 📝 Tipos

### ProductFilters
```tsx
interface ProductFilters {
  search: string;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  isOffer: boolean | null;
  brand: string | null;
  sortBy: "name" | "price-asc" | "price-desc" | "newest" | null;
  page: number;
  pageSize: number;
}
```

---

## 🎨 Características de Diseño

### Responsive
- **Móvil**: 1 columna, filtros colapsables
- **Tablet**: 2 columnas
- **Desktop**: 3 columnas, filtros en sidebar
- **XL**: 4 columnas

### Loading States
- Skeletons animados durante carga
- Deshabilitación de botones cuando producto no disponible

### Empty States
- Mensaje amigable cuando no hay productos
- Sugerencia de ajustar filtros

### Hover Effects
- Imágenes con zoom suave
- Sombra en tarjetas
- Transiciones fluidas

### Truncado de Texto
- Nombres de productos: 2 líneas máximo
- Uso de `line-clamp-2`

---

## 🔄 Flujo de Datos Actual (CSR)

```
mockProducts (constants)
    ↓
useProductFilter (hook)
    ↓
Aplica filtros y ordenamiento
    ↓
Retorna productos paginados
    ↓
ProductGrid muestra ProductCards
```

---

## 🚀 Migración a SSR

Ver `MIGRATION_TO_SSR.md` para una guía completa de cómo migrar este sistema a Server Side Rendering con Supabase.

**Resumen de cambios necesarios**:
1. Convertir página a Server Component
2. Crear servicio de Supabase para obtener productos
3. Usar searchParams en lugar de state
4. Crear componente cliente para interactividad
5. Implementar loading con Suspense

---

## 🧪 Testing

### Casos a probar:
- [ ] Búsqueda por nombre
- [ ] Filtro por categoría
- [ ] Filtro por marca
- [ ] Filtro por rango de precio
- [ ] Filtro solo ofertas
- [ ] Ordenamiento (nombre, precio, fecha)
- [ ] Paginación (siguiente, anterior, números)
- [ ] Cambio de tamaño de página
- [ ] Resetear filtros
- [ ] Estado vacío (sin resultados)
- [ ] Productos no disponibles
- [ ] Responsive en diferentes tamaños

---

## 📦 Dependencias

- Next.js 14+
- React 18+
- Tailwind CSS
- Componentes UI (shadcn/ui o similar)
- TypeScript

---

## 🎯 Próximos pasos

1. **Backend Integration**: Conectar con Supabase
2. **Detalles de Producto**: Crear página de producto individual
3. **Carrito**: Sistema de carrito de compras
4. **Wishlist**: Lista de deseos
5. **Reviews**: Sistema de reseñas
6. **Comparación**: Comparar productos
7. **Imágenes**: Optimización con Next Image
8. **SEO**: Metadata y structured data
