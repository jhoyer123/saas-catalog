"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteModal } from "@/components/shared/DeleteAlert";
import { OverlayProcess } from "@/components/shared/OverlayProcess";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { OptionTypeRow, OptionValueRow } from "../types";
import { useGetOptionValues } from "../hooks/useGetOptionValues";
import { useDeleteOptionValue } from "../hooks/useOptionValueMutations";
import { useToastPromise } from "@/hooks/shared/useToastPromise";
import { useModalsOptionValue } from "../hooks/useModals";
import { OptionValueFormDialog } from "./OptionValueFormDialog";

// IMPORTACIÓN DE COMPONENTES DE TABLA DE SHADCN
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
import { deleteFile } from "@/lib/utils/storage";
import { parseOptionValue } from "../lib/helpers/unitConverter";

interface Props {
  optionType: OptionTypeRow | null;
  onClose: () => void;
}

function buildColorPreviewStyle(colorHexes: string[] | null) {
  const colors = colorHexes ?? [];

  if (colors.length === 0) {
    return { backgroundColor: "hsl(var(--muted))" };
  }

  if (colors.length === 1) {
    return { backgroundColor: colors[0] };
  }

  const segmentSize = 100 / colors.length;
  const gradient = colors
    .map((hex, index) => {
      const start = (segmentSize * index).toFixed(2);
      const end = (segmentSize * (index + 1)).toFixed(2);
      return `${hex} ${start}% ${end}%`;
    })
    .join(", ");

  return { backgroundImage: `conic-gradient(${gradient})` };
}

/**
 * Subcomponente especializado en el renderizado visual de la columna Preview
 */
function ValuePreview({
  value,
  inputType,
}: {
  value: OptionValueRow;
  inputType: string;
}) {
  if (inputType === "color") {
    const colors = value.color_hexes ?? [];
    return (
      <div className="flex items-center gap-2">
        <div
          className="size-7 rounded-full border border-border shadow-sm shrink-0"
          style={buildColorPreviewStyle(colors)}
          title={colors.join(", ")}
        />
        {colors.length === 0 && (
          <span className="text-xs text-muted-foreground">Sin color</span>
        )}
      </div>
    );
  }

  if (inputType === "image" && value.image_url) {
    return (
      <div className="flex items-center">
        <img
          src={getCatalogImageUrl(value.image_url)}
          alt={value.value}
          className="h-12 w-12 rounded border border-slate-200 object-contain bg-gray-50 shrink-0 shadow-sm"
        />
      </div>
    );
  }

  if (inputType === "number" && value.numeric_value != null) {
    return <span className="font-mono text-sm">{value.value}</span>;
  }

  // Por defecto (texto / text u otros), mostramos el valor textual como su propio preview
  return <span className="text-sm font-medium">{value.value}</span>;
}

export function OptionValuesPanel({ optionType, onClose }: Props) {
  const isOpen = !!optionType;

  const { data: values, isLoading } = useGetOptionValues(
    optionType?.id ?? null,
  );
  const { mutateAsync: removeValue, isPending: isDeleting } =
    useDeleteOptionValue();
  const { showPromise } = useToastPromise();
  const {
    modalState: valueModal,
    openModal: openValueModal,
    closeModal: closeValueModal,
  } = useModalsOptionValue();
  const [deleteTarget, setDeleteTarget] = useState<OptionValueRow | null>(null);
  const typeId = optionType?.id;

  const handleDelete = (value: OptionValueRow) => {
    if (!typeId) return;
    const promise = removeValue({ valueId: value.id, typeId });
    showPromise({
      promise: promise.then(() => setDeleteTarget(null)),
      messages: {
        loading: "Eliminando valor...",
        success: "Valor eliminado",
        error: (err: Error) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
    // Si el valor tenía imagen asociada, intentamos borrarla del storage (no bloqueante)
    if (value.image_url) {
      deleteFile("stores", value.image_url).catch(async (err) => {
        console.error("No se pudo borrar archivo viejo:", value.image_url, err);
      });
    }
  };

  return (
    <>
      {isDeleting && <OverlayProcess />}

      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <SheetContent
          side="right"
          className="w-full max-w-full p-0 overflow-y-auto sm:w-150 sm:max-w-2xl"
        >
          {optionType && (
            <>
              <SheetHeader>
                <SheetTitle>Valores de {optionType.name}</SheetTitle>
                <SheetDescription>
                  Gestiona los valores disponibles para este atributo.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4 px-3">
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => openValueModal("create", null)}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Agregar valor
                  </Button>
                </div>

                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-12 animate-pulse rounded-md bg-muted"
                      />
                    ))}
                  </div>
                ) : values && values.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {/* 1. RENDERIZADO CONDICIONAL DE ENCABEZADOS SEGÚN EL TIPO */}
                          {optionType.input_type === "number" ? (
                            <>
                              <TableHead className="w-1/4">Valor</TableHead>
                              <TableHead className="w-1/4">Unidad</TableHead>
                              <TableHead className="w-1/4">
                                Vista Previa
                              </TableHead>
                              <TableHead className="text-right w-1/4">
                                Acciones
                              </TableHead>
                            </>
                          ) : optionType.input_type === "image" ? (
                            <>
                              <TableHead className="w-2/5">Valor</TableHead>
                              <TableHead className="w-2/5">
                                Vista Previa
                              </TableHead>
                              <TableHead className="text-right w-1/5">
                                Acciones
                              </TableHead>
                            </>
                          ) : optionType.input_type === "color" ? (
                            <>
                              <TableHead className="w-2/5">Valor</TableHead>
                              <TableHead className="w-2/5">
                                Vista Previa
                              </TableHead>
                              <TableHead className="text-right w-1/5">
                                Acciones
                              </TableHead>
                            </>
                          ) : (
                            // Por defecto (Texto)
                            <>
                              <TableHead className="w-2/5">Valor</TableHead>
                              <TableHead className="w-2/5">
                                Vista Previa
                              </TableHead>
                              <TableHead className="text-right w-1/5">
                                Acciones
                              </TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {values.map((val) => {
                          // Solo lo ejecutamos si el tipo es "number" para optimizar.
                          const { displayNumber, unit } =
                            optionType.input_type === "number"
                              ? parseOptionValue(val.value)
                              : { displayNumber: null, unit: null };

                          return (
                            <TableRow key={val.id}>
                              {/* PRIMERA COLUMNA: Valor principal */}
                              <TableCell>
                                {optionType.input_type === "number"
                                  ? (displayNumber ?? val.value) // Mostramos solo el número, o el string original como fallback si la función retorna null
                                  : val.value}
                              </TableCell>

                              {/* SEGUNDA COLUMNA: Unidad (Condicional solo para 'number') */}
                              {optionType.input_type === "number" && (
                                <TableCell>{unit ?? " — "}</TableCell>
                              )}

                              {/* TERCERA COLUMNA: Vista Previa */}
                              <TableCell className="font-medium">
                                <ValuePreview
                                  value={val}
                                  inputType={optionType.input_type}
                                />
                              </TableCell>

                              {/* CUARTA COLUMNA: Acciones */}
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openValueModal("edit", val)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setDeleteTarget(val)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No hay valores creados para este atributo.
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {optionType && (
        <OptionValueFormDialog
          modalState={valueModal}
          onClose={closeValueModal}
          optionType={optionType}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          title="Eliminar valor"
          description={
            <>
              ¿Estás seguro de que deseas eliminar el valor{" "}
              <strong>{deleteTarget.value}</strong>? Esta acción no se puede
              deshacer.
            </>
          }
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </>
  );
}
