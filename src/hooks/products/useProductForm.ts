// hooks/useProductForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import {
  productFormSchema,
  productFormSchemaUpdate,
  type ProductFormInput,
  type ProductFormInputUpdate,
  type ProductInputService,
  type ProductInputServiceUpdate,
} from "@/lib/schemas/product";
import { useProductActions } from "./useHandleAction";
import { ProductCatalog } from "@/types/product.types";

type FormMode = "create" | "update" | "view";

interface UseProductFormProps {
  mode: FormMode;
  initialData?: ProductCatalog;
  categories: { id: string; name: string }[];
}

export function useProductForm({
  mode,
  initialData,
  categories,
}: UseProductFormProps) {
  const isCreate = mode === "create";
  const isUpdate = mode === "update";
  const isView = mode === "view";

  const { createProduct, updateProduct, isPending } = useProductActions();

  const form = useForm({
    resolver: zodResolver(
      isUpdate ? productFormSchemaUpdate : productFormSchema,
    ),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      brand: initialData?.brand ?? "",
      price: initialData?.price ?? 0,
      description: initialData?.description ?? "",
      category_id: initialData?.category_id ?? "",
      imageExisting: initialData?.images ?? [],
      imageToDelete: [],
    },
  });

  //refinar las categorias para el select (memo para evitar recrear el array en cada render)
  const categoryOptions = useMemo(
    () =>
      (categories ?? []).map((cat) => ({
        value: String(cat.id),
        label: cat.name,
      })),
    [categories],
  );

  // Registrar imageToDelete
  useEffect(() => {
    if (isUpdate) {
      form.register("imageToDelete");
    }
  }, [form.register, isUpdate]);

  // Submit
  const handleFormSubmit = (
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

    //execute action
    if (isCreate) {
      createProduct(transformed as ProductInputService, () => {
        form.reset({
          name: "",
          brand: "",
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
        transformed as ProductInputServiceUpdate,
        () => {
          form.reset({
            name: "",
            brand: "",
            sku: "",
            category_id: "",
            description: "",
            price: 0,
          });
        },
      );
    }
  };

  return {
    register: form.register,
    control: form.control,
    handleSubmit: form.handleSubmit(handleFormSubmit),
    errors: form.formState.errors,
    setValue: form.setValue,
    reset: form.reset,
    isViewMode: isView,
    initialData,
    categoryOptions,
    isPending,
  };
}
