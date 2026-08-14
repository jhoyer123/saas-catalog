# Flujo UX/UI y Arquitectura de Componentes: Creación/Edición de Productos con Variantes

## 1. Arquitectura de Archivos (Reutilización de Componentes)
Para evitar un archivo gigante, el formulario principal (`ProductForm.tsx`) actuará como proveedor del contexto de `react-hook-form`. Los sub-componentes consumirán este contexto.

*   `components/products/ProductForm.tsx` (Contenedor principal, maneja el Submit y el layout general).
*   `components/products/GeneralInfoSection.tsx` (Campos de texto y editor Tiptap).
*   `components/products/GeneralImageSection.tsx` (Portada/Imágenes base del producto usando `@dnd-kit`).
*   `components/products/VariantToggleSection.tsx` (El Switch principal `has_variants`).
*   `components/products/AttributesSelector.tsx` (Comboboxes para seleccionar Color, Talla, y sus valores. Maneja el flag `is_visual`).
*   `components/products/VariantsTable.tsx` (Tabla generada con `@tanstack/react-table` para precios, SKU y switches de estado).
*   `components/products/VisualGalleries.tsx` (Renderiza dinámicamente zonas de drag & drop por cada `visual_signature`).

## 2. Flujo de Interfaz (Vista Única)

La vista fluye de arriba hacia abajo, revelando complejidad solo si el usuario la solicita.

### A. Información General (Siempre Visible)
*   **Campos:** Nombre, Categoría, Marca, Descripción (Tiptap).
*   **Imágenes Generales:** Zona de subida para la portada del producto. Sirve de *fallback* si una variante no tiene galería específica[cite: 1].

### B. El Interruptor (Punto de Inflexión)
*   **UI:** Un Switch destacado: "¿Este producto tiene opciones múltiples? (Tallas, colores, etc.)".
*   **Comportamiento OFF:** Muestra los campos `Precio`, `Precio de Oferta` y `SKU` generales justo debajo.
*   **Comportamiento ON:** Oculta los precios generales y despliega las secciones **C**, **D** y **E**.

### C. Selección de Atributos (`AttributesSelector`)
*   **UI:** Filas dinámicas donde el usuario selecciona el Atributo (Combobox) y sus Valores (Multi-select/Tags).
*   **Configuración Visual:** Un Checkbox o Switch pequeño al lado de cada atributo: "Define Galería de Imágenes (Visual)".
*   **Regla de Negocio (Bloqueo):** Si el formulario está en modo "Edición" y el producto ya tiene variantes en BD, los selectores de Atributo y el checkbox `is_visual` deben estar `disabled`. Un _tooltip_ debe explicar que la estructura ya está fijada[cite: 1]. Solo se permite añadir o quitar valores (tags).

### D. Tabla de Variantes (`VariantsTable`)
*   Generada automáticamente a partir del producto cartesiano de los valores seleccionados.
*   **Columnas:**
    *   Combinación (Ej: Rojo - M).
    *   Precio (Input numérico).
    *   Precio Oferta (Input numérico).
    *   SKU (Input texto).
    *   **Disponibilidad (Switch):** Apaga la variante temporalmente sin borrarla (Ideal para ocultarla del catálogo público).
    *   **Acción (Botón Basurero):** Elimina la variante por completo si físicamente no existe (Ej: Nunca se fabricó la combinación Verde - Talla S). Llama al RPC `delete_variants`[cite: 1].
*   **UX Extra:** Botones en la cabecera de la tabla para "Aplicar precio a todas" o "Generar SKUs automáticamente".

### E. Galerías por Firma Visual (`VisualGalleries`)
*   Sección que solo aparece si hay al menos un atributo marcado como `is_visual`.
*   El sistema agrupa las combinaciones basándose en `visual_signature`[cite: 1].
*   **UI:** Tarjetas separadas.
    *   Tarjeta 1: "📷 Imágenes para: Rojo + Mamá" -> Zona Dropzone.
    *   Tarjeta 2: "📷 Imágenes para: Azul + Niña" -> Zona Dropzone.
*   Nota técnica: Al guardar, estas imágenes se envían con su respectiva firma calculada por la función SQL determinística[cite: 1].

## 3. Manejo de Estados (Create / Edit / View)
Reutilizaremos los mismos componentes mediante *props*:
*   `mode="create"`: Todo habilitado, `has_variants` en falso por defecto.
*   `mode="edit"`: Carga datos usando el RPC transaccional unificado[cite: 1]. Bloquea `product_option_types` si existen variantes[cite: 1].
*   `mode="view"`: Pasa `disabled={true}` a todo el `FormProvider` y oculta los botones de acción (basureros, "añadir atributo").