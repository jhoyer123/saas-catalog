# Plan de Ejecución — Módulo de Variantes de Producto

> **Cómo usar este documento (instrucciones para la IA que ejecuta):**
> - Este documento **no reemplaza** la spec completa (`plan-frontend-parte2-variantes.md`) — la complementa dividiéndola en pasos ejecutables uno a la vez. Antes de cada paso, leer la sección correspondiente de esa spec (se indica cuál en cada paso).
> - **Ejecutar un solo paso por vez.** No adelantarse a pasos futuros ni tocar archivos que no correspondan al paso actual, aunque parezca "más eficiente" hacerlo junto.
> - Al terminar un paso, reportar qué se creó/modificó y detenerse ahí — no seguir automáticamente al siguiente paso sin confirmación.

## ⚠️ Reglas de reutilización obligatorias (leer antes de tocar cualquier paso)

- **Patrón de capas fijo, sin excepción:** `service → hook TanStack → hook maestro`, exactamente como ya está implementado en `products`. No inventar variantes del patrón.
- **`select()` siempre explícito.** Nunca `select('*')` en ningún service nuevo — listar solo las columnas que esa pantalla necesita (secc. 0.3 de la spec).
- **Servicios de lectura de atributos (`listOptionTypesForProduct`, `listOptionValuesForCombinator`) son propios de este módulo**, no se reutiliza el CRUD de Parte 1 (`optionTypesService.list`, `optionValuesService.list`) porque ese trae conteos/timestamps innecesarios acá.
- **Flujo de subida de imágenes YA EXISTE** (compresión + Supabase Storage) — se reutiliza tal cual para imagen de valor visual e imagen puntual de variante. No crear un dropzone nuevo.
- **Skeletons:** reusar el mismo componente base de skeleton ya usado en `products`, no crear un patrón nuevo solo para variantes.
- **Ubicación fija:** todo el código nuevo va en `src/features/variants/product-variants/` (services, hooks, schemas, types, components). Helpers puros van en `src/lib/helpers/`.
- **Nunca 1 request por variante.** Toda operación sobre múltiples variantes (generar, actualizar, borrar) es batch/array en una sola llamada — nunca un loop de requests individuales (detalle completo en Paso 7).
- **Guardado condicionado a cambios reales:** todo formulario usa `isDirty`/`dirtyFields` de react-hook-form para deshabilitar "Guardar" sin cambios, y manda solo el diff, nunca el objeto completo sin necesidad.
- **`is_default_on_create` en `store_option_types` — YA IMPLEMENTADO.** No hay que migrar ni crear nada para esta columna. Solo tenerla en cuenta: debe incluirse en el `select()` de `listOptionTypesForProduct` (Paso 3) y usarse para preseleccionar chips en el selector de atributos (Paso 9).
- **Trigger de sincronización de precio del padre y RLS: NO se implementan en este plan.** Se mencionan solo como contexto de qué depende de qué (ver nota al final). No crear, no intentar resolverlos "de paso" en ningún paso.

---


## Paso 1 — Tipos TypeScript

**Objetivo:** definir los tipos base que todo lo demás va a importar. Sin esto, cualquier paso posterior improvisa tipos y se desalinea.

**Archivos a crear:**
```
src/features/variants/product-variants/types/index.ts
```

**Contenido esperado (tipos, no lógica):**
- `StoreOptionTypeForProduct` (id, name, input_type, is_visual_default, is_default_on_create, sort_order) — shape exacto del `select()` de `listOptionTypesForProduct` (spec secc. 0.3).
- `StoreOptionValueForCombinator` (id, value, color_hexes, image_url, numeric_value, unit) — shape exacto del `select()` de `listOptionValuesForCombinator`. **`color_hexes` es `string[] | null`, NO un solo `hex_color`** — la BD real usa un array (jsonb) para poder representar valores compuestos multicolor (ej. "Rojo/Blanco" con 2 hex a la vez). No reducir a un solo color tomando el primer elemento del array; el componente de swatch debe poder pintar 1 o varios colores según el largo del array.
- `ProductOptionType` (product_id, option_type_id, is_visual).
- `ProductVariant` (id, product_id, store_id, sku, price, offer_price, stock, is_available, created_at, updated_at) + `combinationLabel: string` (campo derivado, no de BD, para la columna legible de la tabla).
- `VariantCombination` (tipo intermedio que usa el generador de combinaciones antes de persistir: `{ values: { optionTypeId: string; optionValueId: string }[]; signature: string }`).
- `BulkGenerateVariantInput` (lo que recibe `bulkGenerate`: combinación + price/sku/stock por defecto si aplica).

**No hacer todavía:** no crear schemas de Zod aquí (van en el paso 2), no crear servicios ni hooks.

**Criterio de listo:** archivo de tipos compila, sin imports de Supabase ni de React.

---

## Paso 2 — Schemas de Zod

**Objetivo:** validación de formularios, separada de los tipos de datos.

**Archivos a crear:**
```
src/features/variants/product-variants/schemas/productOptionTypes.schema.ts
src/features/variants/product-variants/schemas/productVariant.schema.ts
```

**Contenido esperado:**
- `productOptionTypesSelectionSchema`: array de `{ optionTypeId: uuid, isVisual: boolean }`, mínimo 1 elemento si el producto tiene `has_variants = true` (regla 10.1 del plan de BD).
- `variantFormSchema`: `sku` opcional (string o vacío, sin regex de formato impuesto), `price` requerido `number > 0`, `offer_price` opcional `number > 0`, `stock` entero `>= 0` default 0, `is_available` boolean default true. Usar `.refine()` para el aviso no bloqueante de `offer_price < price` (secc. 2.2 de la spec) — si se implementa como warning, no como error duro, dejarlo fuera del `.refine()` bloqueante y resolverlo en el componente.
- `combinatorSelectionSchema`: por atributo, array de `optionValueId[]` con mínimo 1 valor elegido antes de habilitar "Generar" (secc. 3.2).

**No hacer todavía:** no conectar estos schemas a ningún `useForm` real todavía — eso pasa en los pasos de componentes (9+).

**Criterio de listo:** schemas exportados, con al menos un test manual rápido (`schema.safeParse(...)`) confirmando que rechazan los casos inválidos descritos arriba.

---

## Paso 3 — Servicios de lectura livianos (conexión con atributos, secc. 0.3 de la spec)

**Objetivo:** las dos funciones de solo lectura que traen datos de `store_option_types`/`store_option_values` con columnas explícitas, sin reusar el CRUD de Parte 1.

**Archivos a crear:**
```
src/features/variants/product-variants/services/optionsForVariants.service.ts
```

**Contenido esperado:**
- `listOptionTypesForProduct(storeId): Promise<StoreOptionTypeForProduct[]>` — `select('id, name, input_type, is_visual_default, is_default_on_create, sort_order')`, ordenado por `sort_order`.
- `listOptionValuesForCombinator(optionTypeId): Promise<StoreOptionValueForCombinator[]>` — `select('id, value, hex_color, image_url, numeric_value, unit')`, ordenado por `sort_order`.

**No hacer todavía:** no crear hooks de TanStack Query todavía (paso 4), no tocar `product_option_types` ni `product_variants` (pasos 5+).

**Criterio de listo:** ambas funciones devuelven datos reales contra Supabase, tipados con el Paso 1, sin `select('*')`.

---

## Paso 4 — Hooks de TanStack Query para el Paso 3

**Objetivo:** exponer el Paso 3 vía hooks cacheados, siguiendo las query keys definidas en la spec (secc. 0.3: `['option-types-for-product', storeId]`, `['option-values-for-combinator', optionTypeId]`).

**Archivos a crear:**
```
src/features/variants/product-variants/hooks/useOptionTypesForProduct.ts
src/features/variants/product-variants/hooks/useOptionValuesForCombinator.ts
```

**No hacer todavía:** no crear el hook maestro (`useVariantsManager`) todavía — eso es el Paso 8, después de tener también los hooks de variantes (Pasos 6-7).

**Criterio de listo:** hooks devuelven `data/isLoading/isError` correctos, cache separada confirmada (no colisiona con `['option-types', storeId]` de Parte 1).

---

## Paso 5 — Helpers puros (generador de combinaciones + SKU)

**Objetivo:** lógica de negocio sin dependencias de React ni Supabase — testeable aislado.

**Archivos a crear:**
```
src/lib/helpers/generateVariantCombinations.ts
src/lib/helpers/generateSku.ts
```

**Contenido esperado:**
- `generateVariantCombinations(selectedValuesByType: Record<optionTypeId, optionValueId[]>, existingSignatures: string[]): VariantCombination[]` — producto cartesiano, excluye combinaciones cuya `signature` ya esté en `existingSignatures` (diff, secc. 1.4 de la spec). La `signature` se arma ordenando los `optionValueId` de la combinación de forma determinística (mismo criterio siempre, para que el diff funcione).
- `generateSku(productSlug: string, combination: VariantCombination, valuesById: Record<id, StoreOptionValueForCombinator>): string` — concatena slug corto del producto + iniciales de cada valor (secc. 3.1, opt-in vía botón, nunca automático).

**No hacer todavía:** no conectar esto a ningún componente ni service todavía (Paso 9+).

**Criterio de listo:** funciones puras con al menos 2-3 casos de prueba manual cubriendo: cartesiano simple (2 atributos), diff contra combinaciones existentes, límite de `max_variants_per_product` (la validación del límite se hace en el componente, pero la función debe poder recibir un `limit` opcional y cortar temprano si se decide implementarlo ahí — confirmar antes de asumir).

---

## Paso 6 — Servicio de `product_option_types`

**Objetivo:** CRUD del selector de atributos por producto (secc. 2.1 de la spec).

**Archivos a crear:**
```
src/features/variants/product-variants/services/productOptionTypes.service.ts
```

**Funciones:** `list(productId)`, `set(productId, selection: {optionTypeId, isVisual}[])` — `set` reemplaza el set completo (delete + insert en una transacción/RPC si es posible, o dos calls simples si no).

**No hacer todavía:** no tocar `product_variants` (Paso 7).

**Criterio de listo:** `set()` deja exactamente la selección pasada, sin residuos de una selección anterior.

---

## Paso 7 — Servicio de `product_variants`

**Objetivo:** el corazón del módulo — todas las operaciones de variantes, siguiendo estrictamente la regla de batching de la secc. 4.1 de la spec (nunca 1 request por variante).

**Archivos a crear:**
```
supabase/migrations/XXXX_create_product_variants_rpc.sql      ← RPC de creación (ver detalle abajo)
supabase/migrations/XXXX_update_variants_batch_rpc.sql        ← RPC de actualización (ver detalle abajo)
src/features/variants/product-variants/services/productVariants.service.ts
```
(ajustar ruta de migraciones a la convención real del proyecto si es distinta — confirmar antes de crear los archivos)

**Migración 1 — `create_product_variants(p_product_id uuid, p_store_id uuid, p_combinations jsonb)`:**
- Recibe un array jsonb con la forma `[{ sku, price, offer_price, stock, is_available, option_values: [{option_type_id, option_value_id}] }, ...]`.
- Dentro de una sola transacción (una función `plpgsql` ya es transaccional por sí sola):
  1. `INSERT INTO product_variants (...) SELECT ... FROM jsonb_to_recordset(p_combinations) ... RETURNING id` — inserta todas las variantes del batch y captura sus ids nuevos.
  2. Con esos ids ya generados, `INSERT INTO variant_option_values (...) SELECT ...` desanidando el array `option_values` de cada combinación (usar `jsonb_array_elements` cruzado con los ids devueltos en el paso anterior — requiere hacerlo con un CTE que preserve el orden/índice del array para poder mapear cada combinación a su id).
  3. Devuelve los ids/variantes creadas.
- Si cualquier INSERT falla (ej. `option_signature` duplicado), toda la función revierte sola — no queda estado parcial.

**Migración 2 — `update_variants_batch(p_product_id uuid, p_store_id uuid, p_patches jsonb)`:**
- Recibe `[{ id, sku, price, offer_price, stock, is_available }, ...]` — **solo variantes existentes**.
- **Validación previa obligatoria, antes de tocar cualquier fila:**
  1. Contar cuántos de los `id` recibidos existen en `product_variants` **y además pertenecen a `p_product_id`/`p_store_id`** (`SELECT count(*) FROM product_variants WHERE id = ANY(ids) AND product_id = p_product_id AND store_id = p_store_id`).
  2. Si ese conteo no coincide con la cantidad de `id` recibidos → `RAISE EXCEPTION` con el detalle de cuáles no existen o no pertenecen (ej. `'Ids inválidos o de otro producto/tienda: %', ids_faltantes`). Esto aborta toda la función — **no se aplica nada parcial**, el cliente recibe un error explícito en vez de tener que comparar arrays de ids devueltos.
- Recién si la validación pasa, ejecutar el `UPDATE`:
  `UPDATE product_variants SET sku = ..., price = ..., ... FROM jsonb_to_recordset(p_patches) AS p(...) WHERE product_variants.id = p.id`.
- Es **UPDATE puro**, nunca upsert.

Con esta validación, `update_variants_batch` pasa a ser **todo o nada**: o se aplican los cambios de las N variantes, o ninguno — reemplaza el mecanismo de "comparar ids devueltos" que se había planteado antes (ya no hace falta ese diff en el hook del Paso 8, la RPC misma garantiza consistencia).

**Funciones del service (llaman a las RPC de arriba, no hacen SQL propio):**
- `list(productId)` → query normal de Supabase (`select` con join), sin RPC — solo lectura, sin el riesgo que sí tiene `updateMany`.
- `bulkGenerate(productId, storeId, combinations)` → `supabase.rpc('create_product_variants', { p_product_id, p_store_id, p_combinations: combinations })` — **un solo request**, toda la lógica de los 2 inserts vive dentro de la RPC (migración 1 de arriba), no en el cliente.
- `updateMany(productId, storeId, patches)` → `supabase.rpc('update_variants_batch', { p_product_id: productId, p_store_id: storeId, p_patches: patches })` — **un solo request**; la RPC valida pertenencia y existencia antes de aplicar nada (migración 2), nunca `upsert`.
- `delete(variantIds: string[])` → `delete ... where id = any(array)` directo, sin RPC (un `DELETE` no tiene el problema de ambigüedad que sí tiene `upsert`).
- `setAvailability(variantIds: string[], isAvailable: boolean)` → `update ... where id = any(array)` directo, sin RPC (un solo campo booleano, sin riesgo de crear filas).

**No hacer todavía:** no crear hooks todavía (Paso 8). No crear ningún trigger de Postgres — eso se hace al cierre del módulo, fuera de este plan. Las RPC `create_product_variants` y `update_variants_batch` de este mismo paso **no son el trigger de sincronización de precio** — son cosas distintas, no confundir una con otra.

> **Nota — alcance de las RPC transaccionales:** ni `create_product_variants` (bulkGenerate) ni `update_variants_batch` manejan imágenes. Storage y Postgres son sistemas distintos, no hay transacción atómica que abarque ambos. El orden correcto (ver Paso 12) es: subir a Storage → obtener URL → recién ahí insertar/actualizar la fila que la referencia. Como la imagen puntual de variante requiere `variant_id` (FK), es físicamente imposible subirla antes de que la variante exista — el orden seguro queda garantizado por el propio diseño de la tabla, no hace falta lógica extra acá.

**Criterio de listo:** cada función corresponde a **como máximo 2 requests** de red, nunca a un loop escalando con la cantidad de variantes.

---

## Paso 8 — Hooks de TanStack Query + hook maestro de variantes

**Objetivo:** exponer los Pasos 6 y 7 vía hooks, y el hook maestro que orquesta todo para los componentes.

**Archivos a crear:**
```
src/features/variants/product-variants/hooks/useProductOptionTypes.ts
src/features/variants/product-variants/hooks/useProductVariants.ts
src/features/variants/product-variants/hooks/useBulkGenerateVariants.ts
src/features/variants/product-variants/hooks/useUpdateVariants.ts
src/features/variants/product-variants/hooks/useDeleteVariants.ts
src/features/variants/product-variants/hooks/useVariantsManager.ts   ← hook maestro
```

**Reglas del hook maestro (`useVariantsManager`):**
- Recibe `productId` (y `storeId` si hace falta para `bulkGenerate`).
- Query de variantes con `enabled: activeTab === 'variantes'` recibido como parámetro o manejado por el componente que lo llama (secc. 4.2 — no fetch hasta abrir la tab).
- En el `onSuccess` de **cualquier** mutación (bulkGenerate, updateMany, delete, setAvailability): invalidar **en la misma llamada** `['product', productId]` y `['variants-for-product', productId]` (o el nombre de key elegido) — nunca invalidaciones separadas (secc. 4.1).
- **`updateMany` es todo o nada:** la RPC `update_variants_batch` valida existencia y pertenencia (`product_id`/`store_id`) **antes** de aplicar cualquier cambio, y falla con un error explícito si algo no encaja — no hace falta comparar arrays de ids devueltos en el hook, alcanza con manejar el error de la mutación (toast con el mensaje de la excepción) en el `onError`.
- Expone al componente: `{ variants, isLoading, isError, generate, updateChanges, deleteSelected, setAvailability }` — el componente no debe llamar servicios directo, solo este hook.

**No hacer todavía:** no crear ningún componente visual todavía — este paso es 100% lógica/estado.

**Criterio de listo:** el hook maestro puede probarse desde una página temporal simple (sin diseño) que solo imprima el estado, confirmando que la invalidación cruzada funciona (cambiar una variante y ver que `products` también refresca su precio).

---

## Paso 9 — Componente: selector de atributos del producto

**Objetivo:** UI de la secc. 1.2 de la spec — multi-select de `store_option_types` con preselección de `is_default_on_create` (addendum) y switch de `is_visual` inline.

**Archivos a crear:**
```
src/features/variants/product-variants/components/OptionTypesSelector.tsx
```

**Debe usar:** `useOptionTypesForProduct` (Paso 4), `useProductOptionTypes`/`set` (Paso 8), Command/combobox de shadcn.

**Estados a implementar (secc. 5.2 de la spec, fila `OptionTypesSelector`):** skeleton de chips, error inline + reintentar, vacío con link a Parte 1.

**No hacer todavía:** no construir el combinador (Paso 10), no construir la tabla de variantes (Paso 11).

**Criterio de listo:** al montar, los atributos con `is_default_on_create = true` aparecen ya seleccionados; el usuario puede agregar/quitar libremente; el switch `is_visual` por chip se guarda correctamente.

---

## Paso 10 — Componente: combinador de variantes

**Objetivo:** UI de la secc. 1.4 de la spec — Dialog/Sheet con chips de valores por atributo, preview de N combinaciones, validación contra `max_variants_per_product`, botón "Generar".

**Archivos a crear:**
```
src/features/variants/product-variants/components/VariantsCombinator.tsx
```

**Debe usar:** `useOptionValuesForCombinator` (Paso 4) por cada atributo seleccionado, `generateVariantCombinations` (Paso 5), `generate` del hook maestro (Paso 8), `combinatorSelectionSchema` (Paso 2).

**Estados a implementar (secc. 5.2, filas "Combinador" y "Preview" y "Botón Generar"):** skeleton independiente por atributo, error puntual por atributo sin tumbar el resto, mensaje de 0 valores por atributo, loading en el botón "Generar" durante la transacción, toast + combinador abierto si falla.

**No hacer todavía:** no tocar la tabla de variantes todavía (Paso 11) — este componente solo genera, no edita variantes existentes más allá del diff automático ya resuelto por `generateVariantCombinations`.

**Criterio de listo:** genera correctamente el diff (no duplica combinaciones existentes), respeta el límite del plan bloqueando el botón, y usa `bulkGenerate` en una sola operación batch.

---

## Paso 11 — Componente: tabla de variantes

**Objetivo:** UI de la secc. 1.5 de la spec — tabla editable inline con TanStack Table, acciones masivas, `isDirty`/diff con react-hook-form (secc. 5.1), estados de la secc. 5.2.

**Archivos a crear:**
```
src/features/variants/product-variants/components/VariantsTable.tsx
src/features/variants/product-variants/components/VariantsTableRow.tsx   (si conviene separarlo)
```

**Debe usar:** `useVariantsManager` (Paso 8), `variantFormSchema` (Paso 2), react-hook-form con `isDirty`/`dirtyFields` por fila o a nivel tabla, `generateSku` (Paso 5) conectado al botón "Generar" de SKU (opt-in, secc. anterior sobre SKU).

**Reglas obligatorias de este paso:**
- Botón "Guardar cambios" deshabilitado si no hay `dirtyFields` (secc. 5.1).
- Al guardar, mandar **solo el diff** vía `updateMany`, y hacer `reset()` con los nuevos valores tras éxito.
- Acciones masivas (aplicar precio/stock a selección) solo visibles con ≥2 filas seleccionadas.
- `AlertDialog` al intentar borrar/desactivar la última variante activa (secc. 1.7 y 4.7).
- Responsive: misma tabla con scroll horizontal en mobile, sin componente alternativo (aclarado — sistema en validación, no crear versión mobile dedicada).

**No hacer todavía:** no integrar esto en la página de producto todavía (Paso 12).

**Criterio de listo:** editar una celda no dispara ningún request hasta blur/botón; guardar manda un solo `updateMany` con el diff exacto; botón deshabilitado sin cambios.

---

## Paso 12 — Imagen propia de variante (excepción)

**Objetivo:** botón puntual por fila que reutiliza el flujo de imágenes **ya existente** (compresión + Storage), sin construir un dropzone nuevo.

**Archivos a modificar:** `VariantsTableRow.tsx` (o `VariantsTable.tsx` si no se separó).

**Debe reusar:** el hook/componente de subida de imágenes ya implementado (ubicar en `src/components/shared/` o `src/lib/helpers/` según confirmes) — **no crear un nuevo flujo de subida**.

**No hacer todavía:** no tocar la herencia de imagen por valor visual (eso ya funciona solo desde Parte 1, sin cambios acá).

> **Orden obligatorio (evita archivos huérfanos "peligrosos", aunque huérfanos simples son aceptables):** 1) subir a Storage, 2) obtener URL, 3) recién ahí `INSERT` en `product_images` con `variant_id`. Nunca insertar la fila antes de tener la URL real. Si el paso 3 falla tras subir el archivo, queda un huérfano en Storage — aceptable por ahora (sistema en etapa de validación), no requiere limpieza automática en este paso. Limpieza periódica (comparar bucket vs `product_images`) queda como mejora futura, fuera de este plan.

**Criterio de listo:** botón respeta `max_images_per_variant` (hoy 1) — pasa a "Reemplazar" cuando ya tiene una imagen propia.

---

## Paso 13 — Integración final en la página de producto

**Objetivo:** ensamblar todo en `/productos/[id]/editar` con la estructura de Tabs de la secc. 2 de la spec.

**Archivos a modificar:** la página/formulario de producto ya existente.

**Contenido esperado:**
- Tab "General": campos actuales + switch `has_variants` + `AlertDialog` de confirmación al activarlo en producto ya existente (secc. 1.3) + resumen "Desde $X" de solo lectura cuando `has_variants = true` (secc. 5.2, con su estado de skeleton/error/`null`).
- Tab "Variantes": deshabilitada si el producto no está guardado (`product_id` nulo), monta `OptionTypesSelector` (Paso 9) + `VariantsCombinator` (Paso 10) + `VariantsTable` (Paso 11) solo cuando la tab está activa (`enabled`, secc. 4.2).
- Botón "Guardar producto" deshabilitado si `has_variants = true` y 0 variantes válidas (secc. 5.2, regla 10.1 del plan de BD).

**No hacer todavía:** no tocar el trigger de BD (fuera de este plan), no tocar RLS ni índices.

**Criterio de listo:** flujo completo probado manualmente de punta a punta: crear producto con variantes → activar atributos (con preselección) → generar combinaciones → editar precios en batch → ver reflejo en el listado de productos (una vez exista el trigger, o con refetch manual mientras tanto).

---

## Fuera de este plan (solo contexto, NO ejecutar)

- **Trigger de sincronización de precio/oferta del padre**: qué hace (para que la IA entienda de qué depende el resumen "Desde $X" del Paso 13) — corre en cada insert/update/delete de `product_variants`, recalcula `products.price` como mínimo entre variantes activas, activa oferta del padre si alguna variante tiene `offer_price`, y marca `products.is_available = false` si no queda ninguna variante activa. **No se crea en este plan.** Mientras no exista, el resumen "Desde $X" puede mostrar datos desactualizados hasta un refetch manual — es un estado transitorio aceptado, no un bug a resolver acá.
- **RLS de las tablas nuevas del módulo.**
- **Índices de optimización adicionales** más allá de los ya definidos en la migración original.

Estas tres tareas se abordan juntas, tabla por tabla, **después** de que todo el módulo funcione end-to-end — es trabajo nuestro (no de la IA ejecutora de este plan), en una sesión aparte.
