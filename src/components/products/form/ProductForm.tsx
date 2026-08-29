"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  useFieldArray,
  FormProvider,
  type UseFormReturn,
  type UseFieldArrayReturn,
} from "react-hook-form";
import {
  ProductFormInput,
  ProductFormOutput,
  productFormSchema,
} from "@/lib/schemas/productSchema";
import { useMemo } from "react";

export type ProductFormMode = "create" | "edit" | "view";

// tipos con los 3 generics en una sola línea, sin partir el statement
export interface ProductFormHelpers {
  form: UseFormReturn<ProductFormInput, unknown, ProductFormOutput>;
  variantsField: UseFieldArrayReturn<ProductFormInput, "variants", "_fieldId">;
  optionTypesField: UseFieldArrayReturn<
    ProductFormInput,
    "option_types",
    "_fieldId"
  >;
  isReadOnly: boolean;
  isActuallyDirty: boolean;
}

interface ProductFormProps {
  mode: ProductFormMode;
  defaultValues?: Partial<ProductFormInput>;
  onSubmit?: (data: ProductFormOutput) => void | Promise<void>;
  children: (helpers: ProductFormHelpers) => React.ReactNode;
}

const emptyDefaults: ProductFormInput = {
  name: "",
  sku: "",
  slug: "",
  brand_id: "",
  category_id: "",
  description: "",
  has_variants: false,
  price: null,
  option_types: [],
  variants: [],
  product_images: [],
  product_existing_images: [],
  imageToDelete: [],
};

export function ProductForm({
  mode,
  defaultValues,
  onSubmit,
  children,
}: ProductFormProps) {
  const isReadOnly = mode === "view";
  const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues: { ...emptyDefaults, ...defaultValues },
    disabled: isReadOnly,
  });

  // Extraemos dirtyFields Y isDirty de formState
  const { dirtyFields, isDirty } = form.formState;

  // Envolvemos la lógica en un useMemo para mejor rendimiento
  const isActuallyDirty = useMemo(() => {
    // 1. Si el formulario no está sucio nativamente, devolvemos false directamente
    if (!isDirty) return false;

    // 2. Función recursiva para buscar cambios reales ignorando "is_available"
    const hasMeaningfulChange = (dirtyNode: any, keyName?: string): boolean => {
      // Caso base: RHF marca los campos que de verdad están sucios con el booleano `true`
      if (dirtyNode === true) {
        return keyName !== "is_available"; // Retorna true SOLO si no es el campo ignorado
      }

      // Si es un array (ej: un array de variants modificado), validamos sus elementos
      if (Array.isArray(dirtyNode)) {
        return dirtyNode.some((item) => hasMeaningfulChange(item));
      }

      // Si es un objeto, iteramos sobre sus propiedades
      if (dirtyNode && typeof dirtyNode === "object") {
        return Object.entries(dirtyNode).some(([key, value]) =>
          hasMeaningfulChange(value, key),
        );
      }

      // Si es undefined, false, o un objeto/array vacío, no cuenta como sucio
      return false;
    };

    return hasMeaningfulChange(dirtyFields);
  }, [dirtyFields, isDirty]); // Dependemos de ambas propiedades

  const variantsField = useFieldArray({
    control: form.control,
    name: "variants",
    keyName: "_fieldId",
  });

  const optionTypesField = useFieldArray({
    control: form.control,
    name: "option_types",
    keyName: "_fieldId",
  });

  const handleValidSubmit = form.handleSubmit(async (data) => {
    if (isReadOnly || !onSubmit) return;
    await onSubmit(data);
  });

  const helpers: ProductFormHelpers = {
    form,
    variantsField,
    optionTypesField,
    isReadOnly,
    isActuallyDirty,
  };

  return (
    <FormProvider {...form}>
      <form
        id="product-form"
        onSubmit={handleValidSubmit}
        noValidate
        className="mx-auto grid w-full gap-4"
      >
        {children(helpers)}
      </form>
    </FormProvider>
  );
}
