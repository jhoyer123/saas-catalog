// hooks/useProductForm.ts
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
import { useProductActions } from "./useHandleAction";
import { ProductDetail } from "@/types/product.types";
import { useSessionData } from "../auth/useSessionData";

type FormMode = "create" | "update" | "view";

interface UseProductFormProps {
  mode: FormMode;
  initialData?: ProductDetail;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

export function useProductForm({
  mode,
  initialData,
  categories,
  brands,
}: UseProductFormProps) {
  const isCreate = mode === "create";
  const isUpdate = mode === "update";
  const isView = mode === "view";

  const { createProduct, updateProduct, isPending } = useProductActions();
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  //const storeSlug = sessionData?.store?.slug;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(
      isUpdate ? productFormSchemaUpdate : productFormSchema,
    ),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      //brand: initialData?.brand ?? "",
      price: initialData?.price ?? 0,
      description: initialData?.description ?? "",
      category_id: initialData?.category_id ?? "",
      brand_id: initialData?.brand_id ?? "",
      imageExisting: initialData?.images ?? [],
      imageToDelete: [],
    },
  });

  // Cuando initialData llega (o cambia), sincroniza el form
  /*  useEffect(() => {
    if (initialData && isUpdate) {
      reset({
        name: initialData.name ?? "",
        sku: initialData.sku ?? "",
        brand: initialData.brand ?? "",
        price: initialData.price ?? 0,
        description: initialData.description ?? "",
        category_id: initialData.category_id ?? "",
        imageExisting: initialData.images ?? [],
        imageToDelete: [],
      });
    }
  }, [initialData?.id]); */

  //refinar las categorias para el select (memo para evitar recrear el array en cada render)
  const categoryOptions = useMemo(
    () =>
      (categories ?? []).map((cat) => ({
        value: String(cat.id),
        label: cat.name,
      })),
    [categories],
  );

  const brandOptions = useMemo(
    () =>
      (brands ?? []).map((brand) => ({
        value: String(brand.id),
        label: brand.name,
      })),
    [brands],
  );

  useEffect(() => {
    if (isUpdate) {
      register("imageToDelete");
    }
  }, [register, isUpdate]);

  /*  const handleFormSubmit = (
    data: ProductFormInput | ProductFormInputUpdate,
  ) => {
    const transformed = isUpdate
      ? {
          ...data,
          images: (data as ProductFormInputUpdate).images
            ? Array.from((data as ProductFormInputUpdate).images!)
            : undefined,
        }
      : {
          ...data,
          images: Array.from((data as ProductFormInput).images),
        };

    if (isCreate) {
      createProduct(transformed as ProductInputService, () => {
        reset({
          name: "",
          brand_id: "",
          sku: "",
          category_id: "",
          description: "",
          price: 0,
        });
      });
    }

    if (isUpdate) {
      updateProduct(
        initialData?.id!,
        initialData?.slug!,
        transformed as ProductInputServiceUpdate,
        () => {
          reset({
            name: "",
            brand_id: "",
            sku: "",
            category_id: "",
            description: "",
            price: 0,
          });
        },
      );
    }
  }; */

  const handleFormSubmit = (
    data: ProductFormInput | ProductFormInputUpdate,
  ) => {
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
        createProduct(transformed as ProductInputClient, storeId!, () => {
          reset({
            name: "",
            brand_id: "",
            sku: "",
            category_id: "",
            description: "",
            price: 0,
          });
        });
      }

      if (isUpdate) {
        updateProduct(
          initialData?.id!,
          initialData?.slug!,
          transformed as ProductInputClientUpdate,
          storeId!,
          () => {
            reset({
              name: "",
              brand_id: "",
              sku: "",
              category_id: "",
              description: "",
              price: 0,
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
    reset: reset,
    isViewMode: isView,
    initialData,
    categoryOptions,
    brandOptions,
    isPending,
  };
}
