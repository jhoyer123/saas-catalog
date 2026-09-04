/* // hooks/useProductForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import {
  productFormSchema,
  productFormSchemaUpdate,
  type ProductFormInput,
  type ProductFormInputUpdate,
  type ProductInputClient,
  type ProductInputClientUpdate,
} from "@/lib/schemas/product";
import { useProductActions } from "./useHandleProduct";
import { ProductDetail } from "@/types/product.types";
import { useSessionData } from "../auth/useSessionData";
import type { ProductVariantDraft } from "@/features/product/product-variants/types/types";

type FormMode = "create" | "update" | "view";

interface UseProductFormProps {
  mode: FormMode;
  initialData?: ProductDetail;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  variantDraft?: ProductVariantDraft;
}

export function useProductForm({
  mode,
  initialData,
  categories,
  brands,
  variantDraft,
}: UseProductFormProps) {
  const isCreate = mode === "create";
  const isUpdate = mode === "update";
  const isView = mode === "view";

  const { createProduct, updateProduct, isPending } = useProductActions();
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const storeSlug = sessionData?.store?.slug;
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(
      isUpdate ? productFormSchemaUpdate : productFormSchema,
    ),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      price: initialData?.price ?? 0,
      has_variants: initialData?.has_variants ?? false,
      description: initialData?.description ?? "",
      category_id: initialData?.category_id ?? "",
      brand_id: initialData?.brand_id ?? undefined,
      imageExisting: initialData?.images ?? [],
      imageToDelete: [],
      images: undefined, // para crear, se suben nuevas imágenes
    },
  });

  //refinar las datos para el select (memo para evitar recrear el array en cada render)
  const categoryOptions = useMemo(
    () =>
      (categories ?? []).map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    [categories],
  );
  const brandOptions = useMemo(
    () =>
      (brands ?? []).map((brand) => ({
        value: brand.id,
        label: brand.name,
      })),
    [brands],
  );

  useEffect(() => {
    if (isUpdate) {
      register("imageToDelete");
    }
  }, [register, isUpdate]);

  const handleFormSubmit = (
    data: ProductFormInput | ProductFormInputUpdate,
  ) => {
    if (!storeId || !storeSlug) {
      throw new Error(
        "No se encontró la tienda activa para guardar el producto.",
      );
    }

    const transformed = isUpdate
      ? {
          ...data,
          images: (data as ProductFormInputUpdate).images
            ? Array.from((data as ProductFormInputUpdate).images!)
            : [],
        }
      : {
          ...data,
          images: Array.from((data as ProductFormInput).images),
        };

    try {
      if (isCreate) {
        createProduct(
          transformed as ProductInputClient,
          storeId,
          storeSlug,
          variantDraft,
          () => {
            reset({
              name: "",
              brand_id: "",
              sku: "",
              category_id: "",
              has_variants: false,
              description: "",
              price: 0,
              images: undefined,
            });
          },
        );
      }

      if (isUpdate) {
        updateProduct(
          initialData?.id!,
          initialData?.slug!,
          transformed as ProductInputClientUpdate,
          storeId,
          storeSlug,
          () => {
            reset({
              name: "",
              brand_id: "",
              sku: "",
              category_id: "",
              has_variants: false,
              description: "",
              price: 0,
              images: undefined,
              imageExisting: [],
              imageToDelete: [],
            });
          },
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    register: register,
    control: control,
    handleSubmit: handleSubmit(handleFormSubmit),
    errors: errors,
    isDirty: isDirty,
    setValue: setValue,
    watch: watch,
    reset: reset,
    isViewMode: isView,
    initialData,
    categoryOptions,
    brandOptions,
    isPending,
  };
}
 */