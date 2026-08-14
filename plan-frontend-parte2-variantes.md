# Plan de Frontend — Parte 2: Variantes de Producto

> **Alcance de este documento (Parte 1 de esta entrega):** flujo UX completo + estructura de pantallas + inventario de componentes reutilizables ya existentes. Las partes siguientes (campos detallados, reglas de visibilidad/automatización, interacciones/responsive/performance/casos límite) se entregan por separado para no sobrecargar el documento.
>
> Continúa directamente sobre lo ya construido en `plan-frontend-parte1-atributos.md` (CRUD de `store_option_types` / `store_option_values`). Esta parte cubre: selección de atributos por producto (`product_option_types`), generación y gestión de variantes (`product_variants`, `variant_option_values`), imágenes por variante/valor visual, y precio/oferta a nivel variante.

> ⚠️ **PENDIENTE — CREAR AL FINAL:** trigger de BD "Sincronización de precio/oferta del padre" (ver `plan-modulo-variantes.md` secc. 8.3/8.4). Corre en cada insert/update/delete de `product_variants` y recalcula: `products.price` = mínimo precio entre variantes activas; activa oferta del padre si alguna variante tiene `offer_price` (mínimo de esos); si no queda ninguna variante activa → `products.is_available = false`. **Para qué:** permite mostrar "Desde $X" en el catálogo sin JOIN a variantes por tarjeta (rendimiento a escala). El frontend depende de este trigger para el resumen "Desde $X" (secc. 5.2) — hasta que exista, ese resumen puede mostrar datos desactualizados. Se implementa junto con RLS e índices, al cerrar todo el módulo.

> ⚠️ **ADDENDUM — Parte 1 (atributos):** nueva columna en `store_option_types`: **`is_default_on_create`** (boolean, default `false`). Significado: "al crear un producto nuevo con variantes, preselecciona este atributo automáticamente" (evita repetir Color+Talla manualmente en cada producto de ropa, por ejemplo). Sigue siendo editable/eliminable por producto — solo cambia el punto de partida del selector (1.2), no restringe nada. Requiere: (a) migración `ALTER TABLE store_option_types ADD COLUMN is_default_on_create boolean NOT NULL DEFAULT false`, (b) switch nuevo en `OptionTypeFormDialog` (Parte 1), (c) incluir la columna en el `select()` de `listOptionTypesForProduct` (secc. 0.3) — ya que esa función trae columnas explícitas, no `select('*')`.

## 0. Ya existente — no se reconstruye

- Flujo de subida de imágenes (compresión con `browser-image-compression` + Supabase Storage) → se **reutiliza tal cual** para: imagen de variante puntual (excepcional) e imagen de valor visual (la que ya se sube desde `OptionValueFormDialog` cuando `input_type = image`, y la que se necesita para Color aunque `input_type` sea `color`, ver nota 4.2).
- Componentes shadcn ya instalados: `Table`, `Dialog`, `Sheet`, `Switch`, `Select`, `Input`, `Badge`, `Tabs`, `Command`/`cmdk` (combobox), `Popover`, `Tooltip`, `AlertDialog`, `Sonner` (toasts).
- `@dnd-kit` ya en uso para `sort_order` de `store_option_types` → se reutiliza para reordenar `product_option_types` si aplica.
- `@tanstack/react-table` + `@tanstack/react-query` como base de toda tabla/listado.
- Capa de servicios (`services/*.service.ts`) sin llamadas directas a Supabase desde componentes/hooks — mismo patrón que Parte 1.

### 0.1 `is_visual_default` vs `is_visual` — no son lo mismo, no confundir

| Campo | Tabla | Nivel | Qué hace |
|---|---|---|---|
| `is_visual_default` | `store_option_types` | Tienda | Solo es la **sugerencia por defecto**. No dispara nada por sí solo. Se copia como valor inicial al checkbox cuando el usuario agrega ese atributo a un producto. |
| `is_visual` | `product_option_types` | Producto (por atributo elegido) | Es el que **manda de verdad**. Si es `true`, ese atributo dispara galería propia por valor (heredada, secc. 7.2-7.4 del plan de BD) para ESE producto. Editable por producto sin tocar el default de tienda. |

Regla de UI: al marcar un atributo en el selector de 1.2, precargar el switch "¿Visual?" con `is_visual_default`, pero guardarlo siempre como `is_visual` en `product_option_types` — nunca leer `is_visual_default` en runtime del catálogo público, solo se usa como semilla en el formulario.

### 0.3 Conexión con el módulo de Atributos (Parte 1) — funciones propias y livianas, no reusar el CRUD completo

El módulo de variantes **consume** `store_option_types` / `store_option_values`, pero **nunca reutiliza directo** los servicios de listado de Parte 1 (`optionTypesService.list`, `optionValuesService.list`), porque esos están pensados para la tabla de administración (traen conteos de valores, timestamps, todo lo necesario para editar) — acá no hace falta nada de eso, sería sobre-fetching.

Se crean funciones de **solo lectura, con columnas explícitas**, dentro de la propia feature de variantes:

```
// src/features/variants/product-variants/services/optionsForVariants.service.ts
listOptionTypesForProduct(storeId)
  → select('id, name, input_type, is_visual_default, sort_order')   // sin conteos, sin created_at/updated_at
  → usado en el selector de atributos del producto (1.2)

listOptionValuesForCombinator(optionTypeId)
  → select('id, value, hex_color, image_url, numeric_value, unit')   // sin sort_order si no se ordena ahí, sin componentes
  → usado en los chips del combinador (1.4) — NO trae store_option_value_components, eso es exclusivo del CRUD de valores
```

Regla explícita para **todos** los services de esta feature (y recordatorio para las demás): correr en cliente (`"use client"` / hooks de TanStack Query), así que cada `select()` de Supabase debe listar las columnas exactas que la pantalla necesita — **nunca `select('*')`**. Si una pantalla nueva necesita un campo más adelante, se agrega esa columna puntual al `select`, no se cambia a traer todo "por si acaso".

Cache: estas funciones usan sus propias keys (`['option-types-for-product', storeId]`, `['option-values-for-combinator', optionTypeId]`), separadas de las de Parte 1 (`['option-types', storeId]`, `['option-values', typeId]`) — evita que una invalidación pensada para la tabla de administración (que sí necesita refetch de conteos) dispare un refetch innecesario del combinador, y viceversa.

Estructura confirmada del proyecto:
- `src/features/options/` → ya tiene `store_option_types` / `store_option_values` (Parte 1). El módulo de variantes va en **`src/features/variants/product-variants/`** (confirmado).
- `src/components/shared/` → componentes reutilizables entre features (ej. dropzone de imágenes, tablas base, dialogs de confirmación).
- `src/lib/helpers/` → funciones puras reutilizables (ej. compresión de imágenes, generador de SKU, cálculo de combinaciones/producto cartesiano).
- `src/lib/utils/` → utilidades genéricas (formateo, cn, etc.).

Patrón de capas (igual que `products`, replicar tal cual):
```
service          → src/features/variants/product-variants/services/*.service.ts       (llamadas a Supabase)
hook TanStack     → src/features/variants/product-variants/hooks/use*.ts               (un hook por operación: useProductVariants, useCreateVariant, useUpdateVariant, useDeleteVariant, useBulkGenerateVariants...)
hook maestro       → src/features/variants/product-variants/hooks/useVariantsManager.ts (orquesta los hooks de arriba, expone list + create + update + delete + bulkGenerate al componente)
```

Servicios a crear en `src/features/variants/product-variants/services/`:
```
productOptionTypes.service.ts   → list(productId), set(productId, [{optionTypeId, isVisual}])
productVariants.service.ts      → list(productId), bulkGenerate(productId, combinations[]), update(variantId, data),
                                   updateMany(variantId[], patch), delete(variantId), setAvailability(variantId, bool)
```
`variant_option_values` no lleva service propio — es detalle interno de `bulkGenerate` (se inserta junto con cada variante, nunca se expone como CRUD suelto).

Reutilizar sin tocar:
- Dropzone + compresión de imágenes → confirmar si vive en `src/components/shared/` o `src/lib/helpers/`; se referencia igual para imagen de valor visual (ya usado en Parte 1) y para la imagen puntual de variante (1.8).
- Generador de combinaciones (producto cartesiano de valores por atributo) → función pura, va en `src/lib/helpers/` (ej. `generateVariantCombinations.ts`), consumida por el hook maestro antes de llamar a `bulkGenerate`.
- Generador de SKU sugerido → también candidato a `src/lib/helpers/` si no existe ya uno genérico de `products`.

## 1. Flujo UX completo

### 1.1 Crear producto simple (`has_variants = false`)
Sin cambios respecto al flujo actual de `products`: nombre, categoría, marca, precio, oferta (con fechas), stock/disponibilidad, imágenes. El switch "Este producto tiene variantes" arranca apagado.

### 1.2 Activar variantes en un producto nuevo
1. Usuario activa el switch `has_variants` en el formulario de producto.
2. Se ocultan los campos de precio/oferta/stock a nivel producto (pasan a ser de solo lectura una vez guardado, sección 8.3 del plan de BD) y aparece el bloque **"Atributos de este producto"**.
3. Selector multi-select (Command/combobox) con los `store_option_types` de la tienda → **los que tienen `is_default_on_create = true` llegan ya marcados/seleccionados**, ahorrando clicks en el caso típico (ej. ropa: Color + Talla siempre). El usuario puede quitar o agregar libremente desde ahí — la preselección es solo el punto de partida, no una restricción.
4. Por cada tipo elegido, un switch inline "¿Visual?" pre-cargado con `is_visual_default` del tipo, editable ahí mismo (evita ir a otra pantalla).
5. Botón **"Generar combinaciones"** → abre el combinador (sección 1.4).
6. El producto no se puede guardar hasta tener ≥1 variante completa (regla de negocio 10.1 del plan de BD) → botón "Guardar producto" deshabilitado con tooltip explicando por qué, hasta que exista al menos una variante válida.

### 1.3 Convertir producto existente simple → con variantes
Mismo flujo que 1.2, pero disparado desde la edición de un producto ya guardado:
- Al activar el switch, mostrar `AlertDialog` de confirmación: *"Al activar variantes, el precio y disponibilidad de este producto pasarán a calcularse automáticamente desde sus variantes. ¿Continuar?"*
- El precio/oferta actual de `products` se pre-cargan como sugerencia para la primera variante que el usuario cree (no se migran solos, ver 1.4 automatizaciones — el usuario podría no querer un solo SKU).

### 1.4 Combinador de variantes (pantalla/paso central)
- Grilla: por cada atributo seleccionado, chips de sus valores (multi-select) — el usuario elige qué valores participan en la generación (no obliga a usar todos los valores del tipo).
- Preview en tiempo real: "Esto generará N combinaciones" (producto cartesiano de los valores elegidos por atributo).
- Validación contra `max_variants_per_product` del plan **antes** de generar (bloquea con mensaje claro si N supera el límite, no después de intentar guardar).
- Botón "Generar" → crea filas editables en la tabla de variantes (sección 1.5), todavía no persistidas en BD hasta "Guardar".
- Si el producto ya tenía variantes y se vuelve a abrir el combinador para agregar atributos/valores nuevos: solo se generan las combinaciones **faltantes** (diff contra `option_signature` existentes), nunca se duplican ni se borran las ya creadas.

### 1.5 Tabla de variantes (`VariantsTable`)
Tabla editable inline (TanStack Table), una fila por variante:
- Columna combinación (ej. "Rojo / M") — de solo lectura, viene del combinador.
- `sku` (input, sugerido autogenerado, editable).
- `price` (number input).
- `offer_price` (number input, opcional).
- `stock` (number input).
- `is_available` (switch).
- Miniatura de imagen heredada del valor visual (si existe) + botón "Imagen propia" para el caso excepcional (sección 7.4 del plan de BD).
- Acciones por fila: borrar variante.
- Barra de acciones masivas sobre filas seleccionadas: aplicar mismo precio, aplicar mismo stock, activar/desactivar disponibilidad (automatización, ver Parte 3).

### 1.6 Editar producto con variantes ya existentes
Al entrar a edición: `Tabs` con **"General"** (nombre, categoría, marca, descripción — todo lo que sigue siendo editable sin importar `has_variants`) y **"Variantes"** (tabla de 1.5 + botón para reabrir el combinador y agregar más).

### 1.7 Eliminar variantes
- Borrado individual (fila) o masivo (selección) → `ON DELETE CASCADE` en BD, pero el frontend sigue el mismo patrón de confirmación de Parte 1: si es la **última variante activa** del producto, `AlertDialog` explícito: *"Esta es la última variante. Al borrarla, el producto quedará sin stock disponible hasta que agregues una nueva (regla 8.4)."*

### 1.8 Gestión de imágenes
No es pantalla propia: se resuelve desde dos lugares ya existentes, sin flujo nuevo que aprender:
- Imagen de valor visual → se sube desde `OptionValueFormDialog` (Parte 1), reutilizando el dropzone/compresión ya implementado. Todas las variantes que comparten ese valor la heredan automáticamente (no requiere acción en el módulo de variantes).
- Imagen propia de variante (excepción) → botón puntual en la fila de `VariantsTable` (1.5) que abre el mismo dropzone en un `Popover`/`Dialog` chico, limitado a `max_images_per_variant` del plan.

### 1.9 Ofertas
Sin fechas (regla 8.1): un solo input `offer_price` por variante dentro de la misma tabla (1.5), sin diálogo aparte. Si tiene valor, se resalta con `Badge` "Oferta" en esa fila.

## 2. Estructura de pantallas

```
/productos/[id]/editar
├── Tabs
│   ├── General          (siempre visible)
│   │   └── nombre, categoría, marca, descripción, imagen de portada,
│   │       switch has_variants
│   │       └── si has_variants=false: precio, oferta (con fechas), stock, disponibilidad
│   │       └── si has_variants=true: bloque "Atributos de este producto" (1.2) +
│   │                                  resumen de solo lectura (precio desde $X, disponibilidad calculada)
│   └── Variantes         (solo visible si has_variants=true)
│       ├── Selector de atributos del producto (product_option_types)
│       ├── Botón "Generar/editar combinaciones" → abre combinador (Sheet o Dialog full)
│       └── VariantsTable (1.5)
```

Jerarquía visual: "General" prioriza identidad del producto (lo que ve el cliente final primero); "Variantes" prioriza operación (precio/stock/SKU), consistente con que son tareas distintas del dueño de tienda.

---

## Parte 4 — Interacciones, performance/envío de datos, responsive y casos límite

### 4.1 Cómo se manda la data (decisión central)

**Regla general: nunca 1 request por variante. Todo en lote, con la menor cantidad de round-trips posible.**

| Acción | Cómo NO hacerlo | Cómo sí |
|---|---|---|
| Generar combinaciones (1.4) | Loop en el cliente haciendo `insert` uno por uno por cada variante generada | Un solo `bulkGenerate(productId, combinations[])` → idealmente una **función RPC de Postgres** (`insert ... select` o `unnest()` sobre arrays) que inserta todas las filas de `product_variants` + todas las de `variant_option_values` **en una sola transacción**. Si no hay RPC todavía, mínimo: un solo `insert` con array a `product_variants` (Supabase lo soporta nativo) devolviendo los ids, y con esos ids un segundo `insert` con array a `variant_option_values`. Dos requests, no N. |
| Editar precio/stock/SKU en la tabla | Mutación (`update`) por cada `onChange`/tecla | **Edición local optimista** en el estado de la tabla (React state, no BD) mientras el usuario escribe. Guardado real recién con: (a) `onBlur` de esa celda con debounce ~500ms, o (b) botón explícito "Guardar cambios" que manda **un solo** `updateMany` con el array de `{id, patch}` de todo lo que cambió (diff contra el snapshot original) |
| Acción masiva (aplicar precio/stock a selección) | N updates, uno por fila seleccionada | Un `updateMany` con array de ids + patch único |
| Borrado múltiple | N deletes | Un `delete ... where id = any(array)` |
| Invalidación de cache tras cualquier mutación | Invalidar y refetch de una vez consultas separadas | Invalidar `['product', productId]` (para el precio/oferta recalculado por el trigger del padre) **y** `['variants', productId]` juntos, en la misma mutación `onSuccess` — un solo `invalidateQueries` con ambas keys |

Consecuencia directa: `productVariantsService.bulkGenerate` y `updateMany` **no son opcionales**, son la razón de ser de esas dos funciones — no se reemplazan por llamadas sueltas a `update`.

### 4.2 Qué se consulta y cuándo (evitar sobre-fetching)

- La tab "Variantes" **no se monta ni consulta hasta que el usuario la abre** (`enabled: activeTab === 'variantes'` en el hook de TanStack Query) — el listado general de productos no necesita variantes.
- `productVariantsService.list(productId)` trae variantes **con su combinación legible ya resuelta** en una sola query (join a `variant_option_values` → `store_option_values.value`), nunca N+1 (una query de valores por variante).
- La miniatura de imagen heredada (valor visual) se resuelve con el mismo join si es posible, o con una segunda query batcheada por todos los `option_value_id` visuales del producto de una sola vez — nunca una query de imagen por fila de variante.
- Combobox de valores en el combinador: los valores de cada `store_option_type` ya están en cache de Parte 1 (`['option-values', typeId]`) — no se vuelven a pedir.

### 4.3 Tabla grande / muchas variantes

- `max_variants_per_product` acota el techo (10 por default, configurable por plan) — en la práctica la tabla nunca es masiva, así que **no hace falta virtualización** en el caso típico.
- Si el plan permite un número alto (ej. 100+), activar paginación simple de TanStack Table client-side (no server-side) recién a partir de ~50 filas, para no complicar la edición inline con paginación server-side innecesaria.

### 4.4 Interacciones puntuales

- Edición inline sin abrir dialogs: click en celda → input activo, `Enter`/`Tab` confirma y mueve a la siguiente celda (patrón spreadsheet simple, no completo).
- Selección de filas: checkbox por fila + "seleccionar todo" en header, muestra barra de acciones masivas flotante (sticky) solo cuando hay ≥1 fila seleccionada.
- Atajo: `Cmd/Ctrl+S` mientras la tab "Variantes" está enfocada dispara el guardado de cambios pendientes (mismo `updateMany` de 4.1).
- Confirmaciones (`AlertDialog`) solo en: borrar última variante activa (1.7), y activar variantes en producto ya publicado con clientes viéndolo (1.3) — el resto de acciones son reversibles sin fricción.

### 4.5 Responsive

**Desktop (≥1024px):** tabla completa como en 1.5, todas las columnas visibles, edición inline por celda, combinador como `Dialog` ancho con grilla de chips lado a lado por atributo.

**Tablet (768–1023px):** misma tabla pero con columnas secundarias (`SKU`) colapsadas detrás de un botón "más campos" por fila, o scroll horizontal contenido dentro de la tabla (no de toda la página). Combinador igual que desktop pero en `Sheet` lateral en vez de `Dialog` centrado.

**Mobile (<768px) — solo funcional, sin optimizar a fondo (sistema en etapa de validación, no vale invertir en una versión mobile dedicada todavía):**
- Misma tabla y mismo combinador que tablet/desktop, con scroll horizontal contenido dentro de la tabla si no entran todas las columnas — no se construye una vista alternativa de Cards ni un wizard separado por ahora.
- Basta con que los `Dialog`/`Sheet` se abran a ancho completo y los inputs sean usables al tacto (tamaños táctiles razonables vía las clases responsive normales de Tailwind/shadcn) — sin componentes nuevos exclusivos para mobile.
- Si más adelante se pide explícitamente una versión mobile optimizada, ahí se justifica el rediseño (Cards, wizard por pasos, etc.) — no antes.

### 4.6 Performance general

- Memoizar las columnas de `VariantsTable` (`useMemo`) y el cálculo de combinaciones del combinador — no recalcular en cada render.
- `react-hook-form` con modo `onBlur` (no `onChange`) para los inputs de la tabla, para no re-renderizar toda la fila en cada tecla.
- Generador de combinaciones (producto cartesiano) corre client-side sobre los valores ya cacheados — no pega a BD hasta el click en "Generar" definitivo.
- Precio/disponibilidad calculados del padre (`products.price`, `is_available`) se leen de la query de `products` normal (ya cacheada) — el frontend **nunca recalcula el mínimo en el cliente**, siempre confía en el trigger de BD y solo invalida/refetchea esa query tras mutar variantes (4.1).

### 4.7 Casos límite

| Caso | Comportamiento |
|---|---|
| Producto con variantes pero sin ninguna aún (recién activado `has_variants`) | Tab "Variantes" muestra estado vacío con CTA directo "Selecciona atributos y genera tus primeras variantes" — no tabla vacía sin contexto |
| Se alcanza `max_variants_per_product` | Botón "Generar" del combinador deshabilitado con mensaje del límite; si ya está en el límite exacto, se sigue permitiendo editar/borrar variantes existentes sin restricción |
| Se alcanza `max_images_per_variant` (hoy 1) | Botón "Imagen propia" pasa a "Reemplazar" en vez de agregar una segunda |
| Error de red en `bulkGenerate` a medio insertar | Al ser transacción única (RPC), o todo o nada — no queda estado intermedio corrupto; mostrar toast de error y no limpiar el combinador para que el usuario reintente sin re-armar todo |
| SKU duplicado detectado recién al guardar (no hay validación en caché por ser opcional/libre) | Toast de error específico por fila señalando cuál SKU chocó, sin perder los demás cambios del batch |
| Última variante activa desactivada (no borrada, solo `is_available=false`) | Mismo aviso que borrar (1.7), porque dispara la misma regla 8.4 del trigger |

Con esto quedan cerradas las 4 partes planeadas para el módulo de variantes. ¿Revisamos algo puntual (ej. el detalle del RPC de `bulkGenerate`) o pasamos a otra sección del proyecto?

---

## Parte 5 — Estados por componente y guardado condicionado a cambios

### 5.1 Guardado solo si hubo cambios (react-hook-form)

Regla obligatoria en **todos** los formularios de este módulo (form de producto en tab "General", `OptionValueFormDialog` ya existente si aplica, y cada fila/form de variante en mobile-simple):

- Usar `formState.isDirty` (o `isDirty` por campo con `dirtyFields` cuando aplique a edición masiva) para **deshabilitar el botón de guardar** mientras no haya cambios reales respecto al valor cargado inicialmente.
- En `VariantsTable` (edición inline, desktop/tablet): el botón "Guardar cambios" (4.1) permanece oculto/deshabilitado hasta que exista al menos una celda modificada respecto al snapshot original — se arma un diff (`dirtyFields` acumulado por fila) y **solo se manda ese diff** en el `updateMany`, no todas las filas completas.
- Al guardar con éxito: `reset(values)` con los nuevos valores como baseline, para que `isDirty` vuelva a `false` y el botón se vuelva a deshabilitar hasta el próximo cambio real.
- Aplica también al form de producto (tab "General"): si el usuario entra a editar y no toca nada, "Guardar" queda deshabilitado — evita updates vacíos innecesarios a `products`.

### 5.2 Estados por componente (loading / error / vacío)

| Componente | Loading | Error | Vacío |
|---|---|---|---|
| `OptionTypesSelector` (1.2, lista atributos de tienda) | Skeleton de filas de chips (3-4 placeholders) mientras `listOptionTypesForProduct` resuelve | Mensaje inline + botón "Reintentar" (no toast, es bloqueante para continuar el flujo) | "Aún no tienes atributos creados en tu tienda" + link directo al CRUD de Parte 1 |
| Combinador — chips de valores por atributo (1.4) | Skeleton de chips por cada atributo mientras `listOptionValuesForCombinator` resuelve, uno independiente por atributo (no bloquea a los demás) | Mensaje inline en ese atributo puntual + "Reintentar", sin tumbar el resto del combinador | "Este atributo no tiene valores — créalos primero" + link a Parte 1 (ya definido en 3.3) |
| Preview "Generará N combinaciones" | — (cálculo client-side, sin loading) | — | "Selecciona al menos un valor por atributo" cuando N=0 |
| `VariantsTable` (1.5) | Skeleton de filas (usar mismo patrón de skeleton que la tabla de `products` ya tiene) mientras `productVariantsService.list` resuelve | Estado de error de tabla completo con "Reintentar" (reemplaza la tabla, no un toast suelto — es el contenido principal de la tab) | Estado vacío con CTA "Genera tus primeras variantes" (ya definido en 4.7), no tabla con 0 filas sin contexto |
| Botón "Generar" (combinador → bulkGenerate) | Botón en estado loading (spinner + disabled) durante la transacción | Toast de error + combinador permanece abierto con la selección intacta para reintentar (ya definido en 4.7) | — |
| Botón "Guardar cambios" (updateMany) | Estado loading en el botón, tabla queda editable pero con overlay/disabled sutil para evitar doble submit | Toast de error indicando qué filas fallaron si el error es identificable (ej. SKU duplicado, ya definido en 4.7); si es error genérico, toast simple + los cambios locales no se pierden | Botón deshabilitado por `isDirty=false` (5.1), no es un "vacío" pero mismo estado visual inactivo |
| Botón "Imagen propia" por variante | Spinner mientras sube (reutiliza el mismo indicador del flujo de imágenes ya existente) | Toast de error reutilizando el manejo ya existente del flujo de imágenes | Botón en estado "Agregar imagen" (icono +) cuando no hay imagen propia aún |
| Resumen "Desde $X" (tab General, producto con variantes) | Skeleton corto de texto mientras `products` resuelve o mientras se espera el refetch post-trigger | Si `products.price` llega `null` (caso borde 8.4, sin variantes activas) → mostrar "Sin variantes disponibles" en vez de "$null" o "$0" | — |

Todos los skeletons siguen el mismo componente base ya usado en `products` (reutilizar, no crear un nuevo patrón de skeleton solo para variantes).

---

## Parte 2 — Campos detallados

### 2.1 `product_option_types` (selector de atributos del producto, paso 1.2)

| Campo | Origen | Obligatorio | Editable | Visible | Aparece cuando | Desaparece cuando | Default | Validación |
|---|---|---|---|---|---|---|---|---|
| `option_type_id` | `store_option_types.id` (elegido en Command/combobox) | Sí | No tras crear (se borra la fila para "cambiarlo") | Siempre | `has_variants = true` | `has_variants = false` (se limpia toda la selección al desactivar) | — | Debe pertenecer a la misma `store_id`; no se puede repetir el mismo tipo dos veces en el mismo producto (PK compuesta `product_id, option_type_id`) |
| `is_visual` | Copiado de `is_visual_default` al agregar, luego propio | No (tiene default) | Sí, en cualquier momento | Switch inline junto al chip del atributo | Junto con el atributo | — | `is_visual_default` del tipo | Sin restricción de BD; si se desmarca y era el único visual, el producto cae al fallback de imagen genérica (7.3 plan BD) — mostrar aviso informativo, no bloqueante |

Nota: no hay columna `sort_order` en esta tabla (decisión 11 del plan de BD: orden de atributos es solo a nivel tienda). El orden de los chips en pantalla sigue el `sort_order` de `store_option_types`, sin permitir reordenar aquí.

### 2.2 `product_variants` (fila de `VariantsTable`, paso 1.5)

| Campo | Origen | Obligatorio | Editable | Visible | Aparece cuando | Default | Placeholder / ayuda | Validación |
|---|---|---|---|---|---|---|---|---|
| `sku` | Input | **No** (columna permite NULL) | Sí | Siempre | — | Vacío — **no se autogenera solo** | Botón "Generar" junto al input | Único por `store_id` (si tiene valor) — capturar error de constraint de Postgres y mostrar "Ya existe una variante con ese SKU en tu tienda" |
| `price` | Number input | Sí | Sí | Siempre | — | Precargado con `products.price` actual si viene de conversión (1.3), vacío si no | "0.00" | > 0, numeric; bloquea guardar fila si vacío o ≤0 |
| `offer_price` | Number input | No | Sí | Siempre, campo opcional | — | vacío | "Opcional" | Si tiene valor, debe ser > 0 y se recomienda (no bloqueante) que sea menor a `price`, con aviso visual si no lo es |
| `stock` | Number input | Sí (tiene default en BD) | Sí | Siempre | — | `0` | — | Entero ≥ 0 |
| `is_available` | Switch | No (default true) | Sí | Siempre | — | `true` | — | Sin restricción; si se apaga manualmente no afecta el cálculo automático del padre (8.4 solo actúa si no quedan variantes activas) |
| `option_signature` | Calculado (trigger/backend, no editable en UI) | Sí (BD) | No | Oculto — solo se usa la combinación legible ("Rojo / M") como columna de solo lectura | — | — | — | Unicidad por producto (no se puede duplicar combinación); si el usuario intenta generar una combinación repetida en el combinador, se omite del batch con aviso "Ya existe esta combinación" |
| Combinación legible | Derivado de `variant_option_values` → join a `store_option_values.value` | — | No (se edita desde el combinador, no desde la tabla) | Siempre, primera columna | — | — | — | — |

### 2.3 `variant_option_values` (interno, sin UI propia)

No tiene formulario propio: se genera automáticamente al ejecutar `bulkGenerate` desde el combinador (1.4), una fila por `(variant_id, option_value_id, option_type_id)` según la combinación elegida. Regla que la UI debe respetar aunque no se edite directo: **una variante nunca puede tener dos valores del mismo `option_type_id`** — el combinador ya lo garantiza por construcción (una sola selección posible por columna de atributo en cada combinación generada), así que no hace falta validación adicional en este nivel.

---

## Parte 3 — Automatizaciones y reglas de visibilidad

### 3.1 Automatizaciones

| Automatización | Dispara cuándo | Lógica | Dónde vive |
|---|---|---|---|
| **Generador de combinaciones** | Click en "Generar" del combinador (1.4) | Producto cartesiano de los valores elegidos por atributo. Si ya hay variantes, hace diff contra `option_signature` existentes y solo genera las faltantes | `src/lib/helpers/generateVariantCombinations.ts` (función pura) |
| **Generar SKU (bajo demanda)** | Click en botón "Generar" junto al input de `sku`, por fila o masivo sobre la selección | El campo **queda vacío por defecto** al crear la variante (no obligatorio, sección 2.2). El botón concatena iniciales/slug de cada valor de la combinación + slug corto del producto (ej. `CAM-ROJ-M`). No se dispara solo al generar combinaciones — es opt-in, porque todavía no hay módulo de inventario que dependa de tener SKU desde el día uno | `src/lib/helpers/generateSku.ts` — reusar si ya existe uno genérico de `products` |
| **Copiar precio/stock (acción masiva)** | Selección múltiple en `VariantsTable` + botón "Aplicar a selección" | Toma el valor de un input de referencia (el de la fila ancla o un input flotante en la barra de acciones) y lo aplica a todas las filas seleccionadas vía `updateMany` | Hook maestro `useVariantsManager` |
| **Precarga desde conversión simple→variantes** | Al activar `has_variants` en producto existente (1.3) | `products.price` actual se precarga como sugerencia en el primer input de precio de la primera variante que el usuario cree — no se auto-crea ninguna variante, solo rellena el campo | Componente del formulario, no servicio |
| **Sincronización de precio/oferta del padre** | Trigger de BD en cada insert/update/delete de `product_variants` (sección 8.3/8.4 del plan de BD, aún no implementado) | `products.price` = mínimo entre variantes activas; oferta del padre se activa si alguna variante tiene `offer_price`; si no quedan variantes activas → `products.is_available = false` | **Backend/BD**, no frontend — el frontend solo lee el resultado (ver 3.2) e invalida su query tras cualquier mutación de variantes |
| **Herencia de imagen por valor visual** | Automática, sin acción del usuario | Todas las variantes que comparten un `option_value_id` marcado como visual muestran las fotos de ese valor sin subir nada por variante | Ya cubierto por Parte 1 + fallback de orden (7.4 plan BD) en el componente de preview |

### 3.2 Reglas de visibilidad

| Bloque / campo | Se muestra si | Se oculta si | Nota |
|---|---|---|---|
| Precio / oferta con fechas / stock en tab "General" | `has_variants = false` | `has_variants = true` | Al ocultarse, se reemplaza por resumen de solo lectura: "Desde $X" + disponibilidad calculada, con tooltip "Se calcula automáticamente desde tus variantes" |
| Bloque "Atributos de este producto" (selector `product_option_types`) | `has_variants = true` | `has_variants = false` | — |
| Tab "Variantes" completo | `has_variants = true` | `has_variants = false` | Tab deshabilitado (no oculto) si el producto aún no se ha guardado por primera vez, con tooltip "Guarda el producto primero" — evita `product_id` nulo |
| Switch "¿Visual?" por atributo | Siempre que el atributo esté seleccionado | — | — |
| Columna `offer_price` resaltada con Badge "Oferta" | `offer_price IS NOT NULL` en esa fila | — | — |
| Botón "Imagen propia" por variante (excepción) | Siempre visible en la fila | — | Si ya tiene imagen propia, el botón cambia a "Ver/reemplazar" con badge de conteo (respetando `max_images_per_variant`) |
| Botón "Guardar producto" | Producto sin variantes: siempre habilitado si campos obligatorios OK | Producto con variantes y 0 variantes válidas: deshabilitado | Tooltip explicando la regla de negocio 10.1 |
| Aviso "última variante activa" (`AlertDialog`, 1.7) | Se intenta borrar/desactivar la única variante `is_available = true` restante | — | — |
| Botón "Generar combinaciones" en el combinador | Al menos 1 valor elegido por cada atributo seleccionado | Falta elegir valores en algún atributo | — |
| Aviso de límite de plan (`max_variants_per_product`) | Preview del combinador supera el límite | — | Bloquea "Generar", no solo advierte — evita el viaje redondo a BD |

### 3.3 Dependencias entre campos (resumen)

- `is_visual` (product_option_types) depende de `is_visual_default` (store_option_types) solo como semilla inicial, nunca en runtime.
- El combinador depende de que exista ≥1 `product_option_types` con ≥1 valor disponible en su `store_option_types`; si un atributo elegido no tiene valores aún, mostrar aviso inline "Este atributo no tiene valores — créalos primero" con link directo al panel de Parte 1.
- `sku` sugerido depende del slug del producto + valores de la combinación — si el usuario edita el `sku` manualmente después, no se vuelve a pisar aunque cambie la combinación (edge case ya cubierto, pero vale dejarlo explícito).
- `stock`/`price` de acciones masivas dependen de que haya ≥2 filas seleccionadas; con 0 o 1, el botón de acción masiva permanece oculto (no solo deshabilitado, para no ensuciar la barra).
