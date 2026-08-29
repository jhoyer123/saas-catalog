"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductDetail } from "@/types/product.types";
import { CategorySimple } from "@/types/category.types";
import { BrandOfForm } from "@/types/brand.types";
import { Plan } from "@/types/plan.types";
import { ProductIdentitySection } from "./ProductIdentitySection";
import { ProductMediaSection } from "./ProductMediaSection";
import { VariantToggleSection } from "./VariantToggleSection";
import FormInput from "@/components/shared/InputForm";
import { ProductForm } from "./ProductForm";
import {
  ProductFormInput,
  ProductFormOutput,
} from "@/lib/schemas/productSchema";
import { ProductVariantAttributesSection } from "@/features/product/product-variants/components/ProductVariantAttributesSection";
import { useVariantAutoSync } from "@/features/product/product-variants/hooks/useVariantAutoSync";
import {
  NO_VISUAL_KEY,
  ProductVariantsTable,
} from "@/features/product/product-variants/components/Productvariantstable";
import { useVariantImages } from "@/features/product/product-variants/hooks/useVariantImages";
import { buildInitialImagesState } from "@/features/product/product-variants/lib/buildInitialImagesState";
import { VariantGalleryDialog } from "@/features/product/product-variants/components/VariantGalleryDialog";
import { emptyGallery } from "@/features/product/product-variants/types/types";
import { toast } from "sonner";
import { StoreOptionType } from "@/features/product/product-variants/services/optionsForVariants.service";
import {
  brandOptions,
  categoryOptions,
} from "@/features/product/helpers/formatData";
// para calcular firmas activas y validar imágenes de variantes en el submit
import { visualSignature } from "@/features/product/product-variants/lib/generateCombinations";
import { useSessionData } from "@/hooks/auth/useSessionData";
import { generateSlug } from "@/lib/utils/slug";
import { useHandleProduct } from "@/hooks/products/useHandleProduct";
import { OverlayProcess } from "@/components/shared/OverlayProcess";

function generateLocalId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

type ProductWithRelations = {
  id: string;
  name: string;
  sku: string | null;
  slug: string;
  brand_id: string | null;
  category_id: string;
  description: string | null;
  has_variants: boolean;
  price: number | null;
  product_option_types: { option_type_id: string; is_visual: boolean }[];
  product_variants: {
    id: string;
    price: number;
    sku: string | null;
    offer_price: number | null;
    is_available: boolean;
    variant_option_values: {
      option_type_id: string;
      option_value_id: string;
    }[];
  }[];
  images?: string[];
  general_image_details?: {
    id: string;
    image_url: string;
  }[];
  image_details?: {
    id: string;
    image_url: string;
    visual_signature: string | null;
  }[];
};

function productToFormValues(product: ProductWithRelations): ProductFormInput {
  return {
    name: product.name,
    sku: product.sku ?? "",
    slug: product.slug ?? "",
    brand_id: product.brand_id ?? "",
    category_id: product.category_id,
    description: product.description ?? "",
    has_variants: product.has_variants,
    price: product.price,
    option_types: product.product_option_types.map((ot) => ({
      option_type_id: ot.option_type_id,
      is_visual: ot.is_visual,
    })),
    variants: product.product_variants.map((v) => ({
      _localId: generateLocalId(),
      id: v.id,
      price: v.price,
      sku: v.sku ?? "",
      offer_price: v.offer_price,
      is_available: v.is_available,
      _removed: false,
      option_values: v.variant_option_values.map((ov) => ({
        option_type_id: ov.option_type_id,
        option_value_id: ov.option_value_id,
      })),
    })),
    product_images: [],
    product_existing_images: product.images ?? [],
    imageToDelete: [],
  };
}

/** reconstruye valuesByType a partir de las variantes ya cargadas, para edit/view */
function buildValuesByTypeFromVariants(
  product?: ProductWithRelations,
): Record<string, string[]> {
  if (!product) return {};
  const map: Record<string, Set<string>> = {};
  product.product_variants.forEach((v) => {
    v.variant_option_values.forEach((ov) => {
      if (!map[ov.option_type_id]) map[ov.option_type_id] = new Set();
      map[ov.option_type_id].add(ov.option_value_id);
    });
  });
  return Object.fromEntries(
    Object.entries(map).map(([k, set]) => [k, Array.from(set)]),
  );
}

interface FormProductProps {
  initialData?: ProductDetail;
  onDirtyChange?: (isDirty: boolean) => void;
  mode: "create" | "edit" | "view";
  categories: CategorySimple[];
  brands: BrandOfForm[];
  plan: Plan;
  storeOptionTypes: StoreOptionType[];
}

export default function FormProduct({
  initialData,
  onDirtyChange,
  mode,
  categories,
  brands,
  plan,
  storeOptionTypes,
}: FormProductProps) {
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const storeSlug = sessionData?.store?.slug;

  // state local: qué valores están tildados por atributo (no vive en el schema)
  const [valuesByType, setValuesByType] = useState<Record<string, string[]>>(
    () =>
      buildValuesByTypeFromVariants(
        initialData as unknown as ProductWithRelations,
      ),
  );
  const [visualTypeIds, setVisualTypeIds] = useState<string[]>(
    () =>
      initialData?.product_option_types
        .filter((optionType) => optionType.is_visual)
        .map((optionType) => optionType.option_type_id) ?? [],
  );

  const isModCreate = mode === "create";

  // los atributos se bloquean en edición una vez el producto ya tiene variantes
  const canEditAttributes =
    isModCreate ||
    (initialData ? initialData.product_variants.length === 0 : true);

  // `imagesApi` se crea DENTRO del render-prop de <ProductForm> (más abajo),
  // no en el scope de este componente. `handleSubmit` en cambio vive acá
  // afuera, porque es lo que se le pasa como prop a <ProductForm>. Este ref
  // es el puente entre los dos: se actualiza en cada render del render-prop
  // y handleSubmit lee siempre el valor más reciente al momento del submit.
  const imagesApiRef = useRef<ReturnType<typeof useVariantImages> | null>(null);
  const resetFormRef = useRef<(() => void) | null>(null);
  const { createProduct, updateProduct, isPending } = useHandleProduct();

  // handler de submit, se pasa a ProductForm y se invoca desde allí
  async function handleSubmit(data: ProductFormOutput) {
    if (!storeId || !storeSlug) {
      toast.error("No se pudo obtener la tienda del usuario.");
      return;
    }
    try {
      // validacion de imagenes de variantes por firma visual
      if (data.has_variants) {
        const imagesState = imagesApiRef.current?.state;

        if (!imagesState) {
          toast.error(
            "No se pudieron validar las imágenes de las variantes. Intenta de nuevo.",
          );
          return;
        }

        const visualTypeIds = data.option_types
          .filter((ot) => ot.is_visual)
          .map((ot) => ot.option_type_id);

        const activeSignatures = new Set(
          data.variants
            .filter((v) => !v._removed)
            .map((v) => visualSignature(v.option_values, visualTypeIds)),
        );

        let missingCount = 0;
        activeSignatures.forEach((sig) => {
          const gallery =
            sig === null ? imagesState.general : imagesState.bySignature[sig];
          const count =
            (gallery?.existing.length ?? 0) + (gallery?.newFiles.length ?? 0);
          if (count === 0) missingCount += 1;
        });

        if (missingCount > 0 && visualTypeIds.length > 0) {
          toast.error(
            missingCount === 1
              ? "Falta subir una imagen para una combinación de variantes."
              : `Faltan subir imágenes para ${missingCount} combinaciones de variantes.`,
          );
          return;
        }
      }
      data = { ...data, slug: generateSlug(data.name) };
      console.log(JSON.stringify(data, null, 2));
      console.log(JSON.stringify(imagesApiRef.current?.state, null, 2));
      console.log(imagesApiRef.current?.state);
      // persistencia: producto + variantes + imágenes (create o edit)
      const result =
        mode === "create"
          ? await createProduct(
              data,
              imagesApiRef.current?.state!,
              storeId,
              storeSlug,
              () => resetFormRef.current?.(),
            )
          : await updateProduct(
              data,
              imagesApiRef.current?.state!,
              storeId,
              storeSlug,
              initialData?.id!,
              () => resetFormRef.current?.(),
            );
    } catch (e) {
      console.error(e);
      toast.error("Ocurrió un error inesperado al guardar el producto.");
    }
  }

  // data refined from category and brand for form
  const categoryOpts = useMemo(() => categoryOptions(categories), [categories]);
  const brandOpts = useMemo(() => brandOptions(brands), [brands]);
  return (
    <>
      {isPending && <OverlayProcess />}
      <ProductForm
        mode={mode}
        defaultValues={
          mode !== "create"
            ? productToFormValues(
                initialData as unknown as ProductWithRelations,
              )
            : undefined
        }
        onSubmit={handleSubmit}
      >
        {({
          form,
          variantsField,
          optionTypesField,
          isReadOnly,
          isActuallyDirty,
        }) => {
          useEffect(() => {
            onDirtyChange?.(isActuallyDirty);
          }, [isActuallyDirty, onDirtyChange]);

          const hasVariants = form.watch("has_variants") as boolean;
          // todos los types/atributos seleccionados para el producto, solo sus ids
          const selectedTypeIds = optionTypesField.fields.map(
            (f) => f.option_type_id,
          );
          // estas son las imagenes de las variantes
          const imagesApi = useVariantImages(
            buildInitialImagesState(
              initialData as unknown as ProductWithRelations,
              visualTypeIds,
            ),
          );

          // mantiene el ref al día para que handleSubmit lea el estado más reciente
          imagesApiRef.current = imagesApi;

          const autoSync = useVariantAutoSync({
            form,
            variantsField,
            markNewVariantsAsRemoved: mode !== "create",
            selectedTypeIds,
            valuesByType,
            visualTypeIds,
            imagesApi,
          });

          const [openSigKey, setOpenSigKey] = useState<string | null>(null);

          resetFormRef.current = () => {
            form.reset();
            setTimeout(() => {
              form.clearErrors();
            }, 0);
            setValuesByType({});
            setVisualTypeIds([]);
            setOpenSigKey(null);
            imagesApi.reset();
          };

          const handleAttributeStructureChange = (
            nextSelectedTypeIds: string[],
            nextValuesByType: Record<string, string[]>,
          ) => {
            // 1. Actualizar el estado de valuesByType en el padre para sincronizar los chips
            setValuesByType(nextValuesByType);
            autoSync.resetVariants(nextSelectedTypeIds, nextValuesByType);
          };

          return (
            <>
              <VariantToggleSection<ProductFormInput>
                control={form.control}
                isViewMode={isReadOnly}
                isCreateMode={isModCreate}
                hasVariants={hasVariants}
                onHasVariantsChange={() => {
                  variantsField.replace([]);
                  optionTypesField.replace([]);
                  setValuesByType({});
                  setVisualTypeIds([]);
                  imagesApi.reset();
                  setOpenSigKey(null);
                }}
              />

              <ProductIdentitySection<ProductFormInput>
                control={form.control}
                errors={form.formState.errors}
                categoryOptions={categoryOpts}
                brandOptions={brandOpts}
                isViewMode={isReadOnly}
              />

              <ProductMediaSection<ProductFormInput>
                control={form.control}
                errors={form.formState.errors}
                setValue={form.setValue}
                getValues={form.getValues}
                maxImages={plan?.max_images_per_product ?? 3}
                existingImages={initialData?.general_image_details ?? []}
                isViewMode={isReadOnly}
              />

              {!hasVariants ? (
                <section className="rounded-2xl border bg-background p-5 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                      Precio del Producto
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ingresa el precio del producto aqui solo si no tiene
                      variantes.
                    </p>
                  </div>
                  <div className="max-w-md">
                    <FormInput
                      label="Precio"
                      name="price"
                      control={form.control}
                      errors={form.formState.errors}
                      inputProps={{
                        type: "number",
                        step: "0.01",
                        min: 0,
                        placeholder: "0.00",
                      }}
                      required
                      readOnly={isReadOnly}
                    />
                  </div>
                </section>
              ) : (
                <>
                  <ProductVariantAttributesSection
                    form={form}
                    optionTypesField={optionTypesField}
                    storeOptionTypes={storeOptionTypes!}
                    isReadOnly={isReadOnly}
                    canEditAttributes={canEditAttributes}
                    valuesByType={valuesByType}
                    onValuesByTypeChange={setValuesByType}
                    onAttributeStructureChange={handleAttributeStructureChange}
                    onVariantValuesChange={
                      isModCreate ? handleAttributeStructureChange : undefined
                    }
                    onVisualConfigurationChange={(nextVisualTypeIds) => {
                      const currentVariants = form.getValues("variants") ?? [];
                      if (
                        imagesApi.state.general.newFiles.length ||
                        Object.values(imagesApi.state.bySignature).some(
                          (g) => g.newFiles.length,
                        )
                      ) {
                        toast.warning(
                          "Cambiaste el atributo que define las imágenes. Las imágenes que todavía no guardaste se descartaron. Volvé a subirlas para las nuevas combinaciones.",
                          { position: "top-center", duration: 6000 },
                        );
                      }
                      imagesApi.resetNewFiles();
                      imagesApi.regroup(currentVariants, nextVisualTypeIds);
                      setVisualTypeIds(nextVisualTypeIds);
                    }}
                  />

                  <ProductVariantsTable
                    form={form}
                    variantsField={variantsField}
                    storeOptionTypes={storeOptionTypes!}
                    isReadOnly={isReadOnly}
                    imagesApi={imagesApi}
                    onOpenImagePicker={(sigKey) => setOpenSigKey(sigKey)}
                    selectedTypeIds={selectedTypeIds}
                    visualTypeIds={visualTypeIds}
                    valuesByType={valuesByType}
                    onToggleRemoved={autoSync.toggleRemoved}
                    onAttributeStructureChange={handleAttributeStructureChange}
                  />

                  {openSigKey && (
                    <VariantGalleryDialog
                      open
                      onOpenChange={(o) => !o && setOpenSigKey(null)}
                      gallery={
                        openSigKey === NO_VISUAL_KEY
                          ? imagesApi.state.general
                          : (imagesApi.state.bySignature[openSigKey] ??
                            emptyGallery())
                      }
                      maxImages={1}
                      onFilesChange={(files) =>
                        imagesApi.setNewFiles(openSigKey, files)
                      } // reemplazo total, no addFiles
                      onRemoveExisting={(entry) =>
                        imagesApi.removeExisting(openSigKey, entry)
                      }
                    />
                  )}
                </>
              )}
            </>
          );
        }}
      </ProductForm>
    </>
  );
}
