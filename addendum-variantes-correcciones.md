# Addendum — Correcciones al Módulo de Variantes

> Este documento **modifica y reemplaza** partes específicas de `plan-modulo-variantes.md` y de la migración `01_migracion_variantes.sql`. Es la versión vigente para lo que aquí se toca; donde no se menciona algo, sigue rigiendo el documento original. Está escrito para corregir una implementación ya hecha por IA sobre el documento anterior — cada sección indica explícitamente **qué cambia y qué se mantiene igual**.

---

## 1. Resumen ejecutivo de los cambios

1. **Imágenes de variante ya NO usan `option_value_id` suelto.** Se reemplaza por `visual_signature`: una firma que representa la combinación completa de todos los atributos marcados `is_visual` en el producto (1, 2, 3 o más atributos).
2. **`variant_id` en `product_images` se mantiene en el esquema, pero no se usa por ahora.** Queda reservado por si en el futuro se pide una foto puntual de una variante específica (excepción a la regla de firma visual). Se elimina solo si en algún momento se confirma que nunca se va a necesitar.
3. **Creación y actualización de producto pasan a ser un RPC transaccional único** — no más inserts sueltos desde el frontend tabla por tabla.
4. **Los atributos del producto (`product_option_types`, incluyendo `is_visual`) se bloquean en edición una vez el producto tiene al menos una variante.** Se puede seguir agregando/quitando **variantes** y **valores** libremente; lo que no se puede tocar es la selección de qué atributos usa el producto.
5. **Se define una sola función de eliminación de variantes, reutilizable en los tres escenarios donde se borran variantes.**

---

## 2. Imágenes: de `option_value_id` a `visual_signature`

### 2.1 Por qué se abandona `option_value_id`
La versión anterior asociaba la imagen a **un solo valor** (ej. "Rojo"). Eso funciona con un único atributo visual, pero se rompe con 2 o más (ej. Color + Persona): no hay forma de saber si una foto pertenece a "Rojo" o a "Mamá" o a la combinación de ambos. La galería real no representa un valor aislado — representa **la combinación completa de todos los valores visuales de esa variante**.

### 2.2 Cambio de esquema

```sql
ALTER TABLE public.product_images
  DROP COLUMN option_value_id,
  ADD COLUMN visual_signature text;
  -- variant_id se conserva tal cual, sin uso activo por ahora (ver sección 3)

CREATE INDEX idx_product_images_visual_signature
  ON public.product_images (product_id, visual_signature);
```

### 2.3 Cómo se construye `visual_signature`
- Insumo: los `option_value_id` de **todos los atributos marcados `is_visual=true`** en `product_option_types` para ese producto, tomados de la variante en cuestión.
- Formato: concatenación **ordenada de forma determinística** (por `option_type_id` ascendente, nunca por orden de inserción ni alfabético del texto del valor) de esos `option_value_id`.
- **Debe generarse siempre con la misma función**, nunca escrita a mano desde el frontend — mismo criterio que ya se usa hoy para `option_signature` en `product_variants`. Se recomienda una función SQL única (`fn_visual_signature(value_ids uuid[])`) que reutilicen: la creación de variantes, la subida de imágenes y las funciones de borrado. Un solo punto de verdad evita que dos cálculos independientes generen firmas distintas para la misma combinación.

### 2.4 Ejemplos (ya validados en conversación)
| Atributos visuales del producto | Combinación | Firma resultante (conceptual) |
|---|---|---|
| Color | Rojo | `color:rojo` |
| Color + Persona | Rojo + Mamá | `color:rojo\|persona:mama` |
| Color + Persona + Estampado | Rojo + Mamá + Flores | `color:rojo\|persona:mama\|estampado:flores` |
| Ningún atributo visual | — | `null` → fallback a galería genérica del producto |

Todas las variantes que comparten esa combinación exacta de valores visuales (sin importar Talla u otros atributos no visuales) comparten la misma galería.

### 2.5 Prioridad de resolución de imagen (actualizada)
1. `visual_signature` de la variante hace match con imágenes del producto que tengan esa misma firma.
2. Si no hay match → galería genérica del producto (portada + imágenes generales).

(`variant_id` queda fuera de esta prioridad por ahora — ver sección 3.)

### 2.6 `variant_id`: se mantiene la columna, sin uso
Se deja el campo en la tabla, sin lógica activa que lo lea ni lo escriba, por si más adelante se pide el caso excepcional de "una variante puntual necesita una foto distinta a la de su combinación visual". No se implementa hoy por simplicidad. Se elimina de la tabla únicamente si en el futuro se confirma explícitamente que no hará falta.

### 2.7 Restricción de atributos bloqueada una vez hay variantes
**Regla nueva, no estaba en el documento original:**

> La selección de atributos del producto (`product_option_types`) — cuáles usa y su flag `is_visual` — se bloquea en edición una vez el producto tiene al menos una variante creada. Cambiar esto invalidaría `option_signature` y `visual_signature` de todo lo ya creado. Si se necesita otra configuración de atributos, se trata como un producto distinto, no una edición del existente.

Lo que **sí** se puede seguir haciendo libremente en cualquier momento, sin bloqueo:
- Agregar nuevas variantes (nuevas combinaciones de valores, usando los mismos atributos ya fijados).
- Eliminar variantes existentes.
- Agregar nuevos valores al catálogo de un atributo (ej. agregar "Verde" a Color) y usarlos en variantes nuevas.

---

## 3. Creación y actualización de producto: RPC transaccional único

### 3.1 Por qué
La implementación anterior insertaba tabla por tabla desde el frontend (`products` → `product_option_types` → `product_variants` → `variant_option_values`). Eso deja ventanas de inconsistencia si algo falla a la mitad (ej. el producto se crea pero sus variantes no, o quedan variantes sin `variant_option_values` completos). Se reemplaza por un único RPC transaccional: **o se crea/actualiza todo, o no se crea/actualiza nada.**

### 3.2 `create_product_with_variants(payload jsonb)`

Recibe un JSON con la forma completa del producto a crear:

```jsonc
{
  "product": { "store_id": "...", "name": "...", "category_id": "...", "has_variants": true, ... },
  "option_types": [
    { "option_type_id": "...", "is_visual": true }
  ],
  "variants": [
    {
      "sku": "...",
      "price": 100,
      "offer_price": null,
      "stock": 10,
      "option_value_ids": ["<id rojo>", "<id M>"]
    }
  ]
}
```

Lógica dentro de la transacción:
1. Insertar en `products`.
2. Insertar en `product_option_types` (una fila por cada atributo elegido, con su `is_visual`).
3. Para cada variante del payload:
   - Calcular `option_signature` a partir de sus `option_value_ids` (función única, mismo criterio que `visual_signature`).
   - Insertar en `product_variants`.
   - Insertar en `variant_option_values` (una fila por cada valor de la combinación).
4. Si cualquier paso falla (ej. choque con el índice único de `option_signature`, límite de plan excedido), **rollback completo** — no queda producto a medias.
5. Devuelve el `product_id` y los `variant_id` creados (el frontend los necesita para, en un segundo paso, subir imágenes a Storage y luego insertar en `product_images` con la `visual_signature` correspondiente — la subida de binarios a Storage no puede ir dentro del RPC de SQL).

### 3.3 `update_product_with_variants(payload jsonb)`
Mismo patrón, pero:
- **No permite tocar `option_types`** si el producto ya tenía variantes antes de esta llamada (regla de la sección 2.7). Si el payload trae cambios de atributos y ya hay variantes preexistentes, el RPC debe rechazar esa parte del payload con un error explícito, no fallar en silencio.
- Sí permite: editar campos de `products`, agregar variantes nuevas, editar variantes existentes (precio, stock, sku, disponibilidad), y eliminar variantes (ver sección 4 — para eliminar variantes se usa la función dedicada, no este RPC general).

### 3.4 Validación de límites de plan
Dentro del mismo RPC transaccional (no en el frontend): antes de insertar variantes, verificar `count(variantes a insertar) + count(variantes existentes) <= max_variants_per_product` del plan de la tienda. Si excede, la transacción falla completa con un error claro, evitando el viaje redondo de validar en frontend y luego fallar en BD de todos modos.

---

## 4. Eliminación de variantes — una sola función para los tres escenarios

### 4.1 Los tres escenarios (todos terminan en el mismo lugar)

| # | Disparador | Qué recibe la función |
|---|---|---|
| A | Usuario borra una variante puntual desde la tabla de variantes | `variant_ids = [x]`, `visual_value_ids` de esa variante |
| B | Usuario quita un valor desde la vista de configuración de variantes del producto (ej. "ya no manejo Verde"), lo que borra todas las variantes que lo usaban | `variant_ids = [x, y, z, ...]` (todas las afectadas), `visual_value_ids` incluyendo el valor quitado |
| C | Usuario borra variantes una por una desde la tabla, y la última que tenía "Verde" desaparece en ese proceso | Igual que A, pero ejecutado N veces (una por cada borrado individual) |

**Los tres son el mismo caso desde la perspectiva de la base de datos**: un conjunto de `variant_id` que se borran, y opcionalmente un conjunto de `option_value_id` visuales asociados a esas variantes, para decidir si hay que limpiar imágenes. No hace falta lógica distinta por escenario — todos llaman a la misma función.

### 4.2 Importante — esto NO borra el valor del catálogo
Un malentendido a evitar: cuando desaparecen todas las variantes que usaban "Verde" (escenario B o C), **"Verde" sigue existiendo en `store_option_values`**. No se borra automáticamente del catálogo de atributos de la tienda. Simplemente deja de estar en uso por *ese producto* — el usuario podría volver a crear una variante "Verde" para ese mismo producto más adelante sin tener que recrear el valor. Borrar el valor del catálogo es una acción **separada, explícita, y solo permitida si no está en uso en ningún lado** (regla de la sección 5).

### 4.3 Función única: `delete_variants(variant_ids uuid[], visual_value_ids uuid[])`

```sql
CREATE OR REPLACE FUNCTION public.delete_variants(
  p_variant_ids uuid[],
  p_visual_value_ids uuid[]   -- puede venir vacío/null si el producto no tiene atributos visuales
)
RETURNS TABLE(deleted_image_urls text[])
LANGUAGE plpgsql
AS $$
DECLARE
  v_signature text;
  v_urls text[];
  v_still_used boolean;
BEGIN
  -- 1. Borrar las variantes indicadas (CASCADE limpia variant_option_values solo)
  DELETE FROM product_variants WHERE id = ANY(p_variant_ids);

  -- 2. Si no había atributos visuales involucrados, no hay nada más que hacer
  IF p_visual_value_ids IS NULL OR array_length(p_visual_value_ids, 1) IS NULL THEN
    RETURN QUERY SELECT NULL::text[];
    RETURN;
  END IF;

  v_signature := fn_visual_signature(p_visual_value_ids); -- misma función única de la sección 2.3

  -- 3. ¿Sigue vivo algún otro grupo de variantes con exactamente esa combinación visual?
  SELECT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE fn_visual_signature(
      (SELECT array_agg(option_value_id) FROM variant_option_values
       WHERE variant_id = pv.id AND option_value_id = ANY(p_visual_value_ids))
    ) = v_signature
  ) INTO v_still_used;

  -- 4. Si nadie más la usa, esa galería queda huérfana: limpiar
  IF NOT v_still_used THEN
    SELECT array_agg(image_url) INTO v_urls
    FROM product_images WHERE visual_signature = v_signature;

    DELETE FROM product_images WHERE visual_signature = v_signature;
  END IF;

  RETURN QUERY SELECT v_urls;
END;
$$;
```

### 4.4 Frontend — un solo patrón para los tres escenarios
```js
const { data } = await supabase.rpc('delete_variants', {
  p_variant_ids: variantIds,          // uno o varios, según el escenario
  p_visual_value_ids: visualValueIds  // [] si el producto no tiene atributos visuales
});

const urls = data[0]?.deleted_image_urls;
if (urls?.length) {
  await supabase.storage.from('product-images').remove(urls.map(extractPath));
}
// null/vacío = o no había atributos visuales, o esa galería sigue en uso por otra variante
```

Esto es válido sin cambios para los escenarios A, B y C — la única diferencia entre ellos es **qué junta el frontend antes de llamar** (una variante vs. varias), no la lógica del RPC.

---

## 5. Recordatorio — regla de borrado de valores del catálogo (no cambia, se reafirma)

Esta regla ya se había fijado en conversación y sigue vigente, se reafirma aquí porque es fácil confundirla con la sección 4:

> **Desde la vista de valores del catálogo de atributos (`OptionValuesPanel`), borrar un valor en uso está bloqueado, sin excepción.** No hay cascade ni confirmación que lo permita forzar — si el valor está en uso (en variantes de cualquier producto, o como componente de un valor compuesto), el borrado no se ejecuta. El usuario debe primero dejar de usar ese valor (quitándolo de las variantes que lo tengan, vía la función de la sección 4) antes de poder borrarlo del catálogo.

---

## 6. Checklist de lo que hay que corregir en lo ya implementado

- [ ] Quitar `option_value_id` de `product_images`, agregar `visual_signature` + índice.
- [ ] Crear función única `fn_visual_signature(value_ids uuid[])` y usarla en: creación de variante, subida de imagen, y `delete_variants`.
- [ ] Reemplazar los inserts sueltos de creación/edición de producto por `create_product_with_variants` / `update_product_with_variants` transaccionales.
- [ ] Agregar bloqueo de edición de `product_option_types` (incluyendo `is_visual`) cuando el producto ya tiene variantes.
- [ ] Reemplazar cualquier lógica de borrado de variante existente por la función única `delete_variants`, usada igual en los tres escenarios (A, B, C) descritos en 4.1.
- [ ] Confirmar que el borrado de valores desde el catálogo (`OptionValuesPanel`) queda bloqueado en uso, sin cascade — no debe usar `checkUsage()` + confirmación como se había planteado antes; debe impedir el borrado directamente.
- [ ] Validar límite de plan (`max_variants_per_product`) dentro del RPC transaccional de creación/actualización, no solo en frontend.
