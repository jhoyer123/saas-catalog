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
  //mode: ProductFormMode;
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
  // NUEVO: sin esto, field.value de estos campos llegaba `undefined` a
  // ProductMediaSection/InputFile en modo create y crasheaba en el primer
  // render (`files.map` sobre undefined).
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
    //mode,
  };

  return (
    <FormProvider {...form}>
      <form
        id="product-form"
        onSubmit={handleValidSubmit}
        noValidate
        className="mx-auto grid w-full gap-6"
      >
        {children(helpers)}
      </form>
    </FormProvider>
  );
}
