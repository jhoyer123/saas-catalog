// hooks/useProductForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import type { ProductType } from "@/types/product.types";
import {
  productFormSchema,
  productFormSchemaUpdate,
  type ProductFormInput,
  type ProductFormInputUpdate,
  type ProductInputService,
  type ProductInputServiceUpdate,
} from "@/lib/schemas/product";

type FormMode = "create" | "update" | "view";

interface UseProductFormProps {
  mode: FormMode;
  initialData?: ProductType;
  onSubmit?: (data: ProductInputService | ProductInputServiceUpdate) => void;
}

export function useProductForm({
  mode,
  initialData,
  onSubmit,
}: UseProductFormProps) {
  const isUpdate = mode === "update" || mode === "view";

  const form = useForm({
    resolver: zodResolver(
      isUpdate ? productFormSchemaUpdate : productFormSchema,
    ),
    mode: "onChange",
    defaultValues:
      isUpdate && initialData
        ? {
            name: initialData.name,
            sku: initialData.sku ?? "",
            brand: initialData.brand ?? "",
            price: initialData.price,
            description: initialData.description,
            category_id: initialData.category_id,
            imageExisting: initialData.imageExisting ?? [],
            imageToDelete: [],
          }
        : {
            name: "",
            brand: "",
            sku: "",
            category_id: "",
            description: "",
            price: 0,
          },
  });

  // Hidratar form
  useEffect(() => {
    if (isUpdate && initialData) {
      form.reset({
        name: initialData.name,
        sku: initialData.sku ?? "",
        brand: initialData.brand ?? "",
        price: initialData.price,
        description: initialData.description,
        category_id: initialData.category_id,
        imageExisting: initialData.imageExisting ?? [],
        imageToDelete: [],
      });
    }
  }, [initialData, isUpdate, form]);

  // Registrar imageToDelete
  useEffect(() => {
    if (isUpdate) {
      form.register("imageToDelete");
    }
  }, [form, isUpdate]);

  // Submit
  const handleFormSubmit = (
    data: ProductFormInput | ProductFormInputUpdate,
  ) => {
    if (!onSubmit) return;

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

    console.log(transformed);
    //onSubmit(transformed);

    // Reset en create
    if (mode === "create") {
      form.reset({
        name: "",
        brand: "",
        sku: "",
        category_id: "",
        description: "",
        price: 0,
      });
    }
  };

  return {
    register: form.register,
    control: form.control,
    handleSubmit: form.handleSubmit(handleFormSubmit),
    errors: form.formState.errors,
    setValue: form.setValue,
    reset: form.reset,
    isViewMode: mode === "view",
  };
}
