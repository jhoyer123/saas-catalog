"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/shared/InputForm";
import {
  optionValueSchema,
  type OptionValueForm,
} from "../schemas/optionValue.schema";
import type { OptionValueModalState } from "../hooks/useModals";
import type { OptionTypeRow } from "../types";
import { useToastPromise } from "@/hooks/shared/useToastPromise";
import {
  useCreateOptionValue,
  useUpdateOptionValue,
} from "../hooks/useOptionValueMutations";
import { processImage } from "@/lib/helpers/image";
import { useSessionData } from "@/hooks/auth/useSessionData";
import { OptionValueColorField } from "./OptionValueColorField";
import { OptionValueNumberField } from "./OptionValueNumberField";
import { OptionValueImageField } from "./OptionValueImageField";
import { uploadFile, deleteFile } from "@/lib/utils/storage";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
import {
  getNormalizedUnit,
  normalizeValue,
} from "../lib/helpers/unitConverter";
import { UnitSymbol, ALL_UNITS } from "../lib/constants/units";
import {
  normalizeTitleCase,
  normalizeColorHexes,
  normalizeText,
} from "../lib/helpers/formatters";
import { OverlayProcess } from "@/components/shared/OverlayProcess";
import { getErrorMessage } from "../lib/errors/getErrorMessage";

// Helper para extraer número y unidad de cadenas como "1 TB" o "10 cm"
function parseOptionValue(value?: string | null) {
  if (!value || typeof value !== "string") {
    return { displayNumber: null, unit: null };
  }

  const parts = value.trim().split(" ");

  if (parts.length === 2) {
    const parsedNum = parseFloat(parts[0]);
    const rawUnit = parts[1];
    const validUnit = ALL_UNITS.find((u) => u.symbol === rawUnit);

    return {
      displayNumber: Number.isNaN(parsedNum) ? null : parsedNum,
      unit: validUnit ? (validUnit.symbol as UnitSymbol) : null,
    };
  }

  const parsedNum = parseFloat(parts[0]);
  return {
    displayNumber: Number.isNaN(parsedNum) ? null : parsedNum,
    unit: null,
  };
}

interface Props {
  modalState: OptionValueModalState;
  onClose: () => void;
  optionType: OptionTypeRow | null;
}

export function OptionValueFormDialog({
  modalState,
  onClose,
  optionType,
}: Props) {
  const isEditing = modalState.mode === "edit";
  const optionValue = modalState.optionValue;
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const inputType = optionType?.input_type ?? "text";

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<OptionValueForm>({
    resolver: zodResolver(optionValueSchema(inputType)),
    defaultValues: {
      value: "",
      color_hexes: [],
      image_url: null,
      displayNumber: null,
      original_unit: null,
    },
  });

  const colorHexes = useWatch({ control, name: "color_hexes" }) ?? [];
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    optionValue?.image_url ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [insertFullData, setInsertFullData] = useState(false);

  const createValue = useCreateOptionValue();
  const updateValue = useUpdateOptionValue();

  const { showPromise } = useToastPromise();

  const isPending =
    createValue.isPending || updateValue.isPending || insertFullData;

  useEffect(() => {
    if (!modalState.open) return;

    // Extraemos el número visible y la unidad elegida originalmente a partir de "value" (ej: "1 TB")
    const { displayNumber, unit } =
      inputType === "number"
        ? parseOptionValue(optionValue?.value)
        : { displayNumber: null, unit: null };

    reset({
      value: optionValue?.value ?? "",
      color_hexes: optionValue?.color_hexes ?? [],
      image_url: optionValue?.image_url ?? null,
      displayNumber: displayNumber,
      original_unit: unit ?? (optionValue?.unit as UnitSymbol | null) ?? null,
    });
    setImagePreview(optionValue?.image_url ?? null);
    setImageFile(null);
  }, [modalState.open, optionValue, inputType, reset]);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imageFile && imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);

    setValue("image_url", previewUrl, {
      shouldValidate: true,
      shouldDirty: true,
    });
    clearErrors("image_url");
  };

  const removeImage = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);

    setValue("image_url", null, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* const onSubmit = async (data: OptionValueForm) => {
    const normalizedColorHexes = normalizeColorHexes(data.color_hexes ?? []);

    if (inputType === "color" && normalizedColorHexes.length === 0) {
      setError("color_hexes", {
        type: "manual",
        message: "Agrega al menos un color.",
      });
      return;
    }

    let imageUrl = data.image_url;
    if (imageFile && inputType === "image" && storeId) {
      setUploadingImage(true);
      try {
        const processed = await processImage(imageFile, {
          targetWidth: 400,
          targetHeight: 400,
          maxSizeBytes: 80 * 1024,
        });

        const resp = await uploadFile({
          bucket: "stores",
          folder: `${storeId}/option-values`,
          file: processed,
        });

        imageUrl = resp.path;

        if (optionValue?.image_url) {
          deleteFile("stores", optionValue.image_url).catch((err) => {
            console.error(
              "No se pudo borrar archivo viejo:",
              optionValue.image_url,
              err,
            );
          });
        }
      } catch {
        showPromise({
          promise: Promise.reject(new Error("Error al subir la imagen")),
          messages: {
            loading: "",
            success: "",
            error: "Error al subir la imagen",
          },
        });
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    // Transformación normalizada según inputType
    let finalValue = "";
    let finalNumericValue: number | null = null;
    let finalUnit: string | null = null;

    switch (inputType) {
      case "color": {
        finalValue = normalizeTitleCase(data.value ?? "");
        break;
      }

      case "text": {
        finalValue = normalizeText(data.value ?? "");
        break;
      }

      case "image": {
        // El value es el nombre de la opción,
        // la imagen va en image_url
        finalValue = normalizeText(data.value ?? "");
        break;
      }

      case "number": {
        if (data.displayNumber != null) {
          finalValue = data.original_unit
            ? `${data.displayNumber} ${data.original_unit}`
            : data.displayNumber.toString();

          finalNumericValue = data.original_unit
            ? normalizeValue(
                data.displayNumber,
                data.original_unit as UnitSymbol,
              )
            : data.displayNumber;

          finalUnit = data.original_unit
            ? getNormalizedUnit(data.original_unit as UnitSymbol)
            : null;
        }

        break;
      }
    }

    const submitData = {
      value: finalValue,
      color_hexes:
        normalizedColorHexes.length > 0 ? normalizedColorHexes : undefined,
      image_url: imageUrl ?? null,
      numeric_value: finalNumericValue,
      unit: finalUnit,
    };

    const promise = isEditing
      ? updateValue.mutateAsync({
          valueId: optionValue!.id,
          dataInput: submitData,
          typeId: optionType!.id,
        })
      : createValue.mutateAsync({
          typeId: optionType!.id,
          dataInput: submitData,
        });

    showPromise({
      promise: promise.then(() => onClose()),
      messages: {
        loading: isEditing ? "Actualizando valor..." : "Creando valor...",
        success: isEditing ? "Valor actualizado" : "Valor creado",
        error: (err: Error) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 4000,
    });
  }; */
  const onSubmit = (data: OptionValueForm) => {
    // 1. Validaciones síncronas rápidas (no necesitan notificación)
    const normalizedColorHexes = normalizeColorHexes(data.color_hexes ?? []);

    if (inputType === "color" && normalizedColorHexes.length === 0) {
      setError("color_hexes", {
        type: "manual",
        message: "Agrega al menos un color.",
      });
      return;
    }

    // 2. Creamos una función maestra que contenga TODO el proceso (imagen + BD)
    const executeSubmitProcess = async () => {
      setInsertFullData(true);
      let imageUrl = data.image_url;
      let newlyUploadedImagePath: string | null = null;

      // PASO A: Subir la imagen si existe
      if (imageFile && inputType === "image" && storeId) {
        try {
          const processed = await processImage(imageFile, {
            targetWidth: 400,
            targetHeight: 400,
            maxSizeBytes: 40 * 1024,
          });

          const resp = await uploadFile({
            bucket: "stores",
            folder: `${storeId}/option-values`,
            file: processed,
          });

          imageUrl = resp.path;
          newlyUploadedImagePath = resp.path;
        } catch (error) {
          throw new Error("Error al procesar o subir la imagen");
          // Al hacer throw aquí, el showPromise lo captura y muestra el error rojo
        }
      }

      // PASO B: Preparar los datos
      let finalValue = "";
      let finalNumericValue: number | null = null;
      let finalUnit: string | null = null;

      switch (inputType) {
        case "color":
          finalValue = normalizeTitleCase(data.value ?? "");
          break;
        case "text":
        case "image":
          finalValue = normalizeText(data.value ?? "");
          break;
        case "number":
          if (data.displayNumber != null) {
            finalValue = data.original_unit
              ? `${data.displayNumber} ${data.original_unit}`
              : data.displayNumber.toString();

            finalNumericValue = data.original_unit
              ? normalizeValue(
                  data.displayNumber,
                  data.original_unit as UnitSymbol,
                )
              : data.displayNumber;

            finalUnit = data.original_unit
              ? getNormalizedUnit(data.original_unit as UnitSymbol)
              : null;
          }
          break;
      }

      const submitData = {
        value: finalValue,
        color_hexes:
          normalizedColorHexes.length > 0 ? normalizedColorHexes : undefined,
        image_url: imageUrl ?? null,
        numeric_value: finalNumericValue,
        unit: finalUnit,
      };
      // PASO C: Guardar en la Base de Datos con Rollback
      try {
        const res = isEditing
          ? await updateValue.mutateAsync({
              valueId: optionValue!.id,
              dataInput: submitData,
              typeId: optionType!.id,
            })
          : await createValue.mutateAsync({
              typeId: optionType!.id,
              dataInput: submitData,
            });

        // Si todo salió bien, borramos la imagen vieja (si existía)
        if (newlyUploadedImagePath && optionValue?.image_url) {
          deleteFile("stores", optionValue.image_url).catch((err) => {
            console.error("No se pudo borrar archivo viejo:", err);
          });
        }

        onClose(); // Cerramos el modal
        return res; // Retornamos el éxito
      } catch (error) {
        // Si la base de datos falla, revertimos (borramos) la imagen nueva que acabamos de subir
        if (newlyUploadedImagePath) {
          await deleteFile("stores", newlyUploadedImagePath).catch(
            (deleteErr) => {
              console.error("No se pudo revertir la imagen nueva:", deleteErr);
            },
          );
        }
        throw error; // Lanzamos el error para que showPromise muestre la alerta
      } finally {
        setInsertFullData(false);
      }
    };

    // 3. ¡Llamamos a showPromise INMEDIATAMENTE!
    // Al pasar executeSubmitProcess(), el toast aparece al instante y abarca TODO el proceso.
    showPromise({
      promise: executeSubmitProcess(),
      messages: {
        loading: isEditing ? "Guardando datos..." : "Creando valor...",
        success: isEditing ? "Valor actualizado" : "Valor creado",
        error: (err: Error) => getErrorMessage(err),
      },
      richColors: true,
      position: "top-right",
      duration: 4000,
    });
  };

  const getImageSrc = (preview: string) => {
    if (preview.startsWith("blob:") || preview.startsWith("data:")) {
      return preview;
    }
    return getCatalogImageUrl(preview);
  };

  if (!modalState.open || !modalState.mode || !optionType || !storeId)
    return null;

  return (
    <>
      {isPending && <OverlayProcess />}
      <Dialog
        open={modalState.open}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="w-[95%] sm:max-w-lg rounded-xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
          <DialogHeader className="p-5 sm:p-6 border-b border-border/40">
            <DialogTitle className="text-lg font-semibold text-foreground">
              {isEditing ? "Editar valor" : "Agregar valor"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {isEditing
                ? "Modifica los datos del valor."
                : "Agrega un nuevo valor para este atributo."}
            </DialogDescription>
          </DialogHeader>

          <form
            id="option-value-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 max-h-[50vh] sm:max-h-[60vh] scrollbar-thin">
              {/* Tipo TEXT */}
              {inputType !== "number" && (
                <FormInput
                  label="Valor"
                  name="value"
                  control={control}
                  inputProps={{
                    placeholder:
                      inputType === "color"
                        ? "Se autocompleta con los colores..."
                        : "Rojo, XL...",
                    readOnly: inputType === "color",
                    disabled: isPending,
                  }}
                  errors={errors}
                  required
                />
              )}

              {/* Tipo NUMBER */}
              {inputType === "number" && (
                <OptionValueNumberField
                  control={control}
                  errors={errors}
                  disabled={isPending}
                />
              )}

              {/* Tipo COLOR */}
              {inputType === "color" && (
                <div className="w-full">
                  <OptionValueColorField
                    colorHexes={colorHexes}
                    disabled={isPending}
                    error={
                      errors.color_hexes?.message
                        ? String(errors.color_hexes.message)
                        : undefined
                    }
                    onChange={(nextHexes, formattedValueName) => {
                      setValue("color_hexes", nextHexes, { shouldDirty: true });
                      if (formattedValueName !== undefined) {
                        setValue("value", formattedValueName, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        clearErrors("value");
                      }
                      clearErrors("color_hexes");
                    }}
                  />
                </div>
              )}

              {/* Tipo IMAGE */}
              {inputType === "image" && (
                <OptionValueImageField
                  imagePreview={imagePreview}
                  fileInputRef={fileInputRef}
                  disabled={isPending}
                  errors={errors}
                  getImageSrc={getImageSrc}
                  onSelectImage={handleImageSelect}
                  onRemoveImage={removeImage}
                />
              )}
            </div>
          </form>

          <DialogFooter className="p-5 sm:p-6 border-t border-border/40 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 bg-muted/20">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="option-value-form"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isEditing ? "Guardar cambios" : "Agregar valor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
