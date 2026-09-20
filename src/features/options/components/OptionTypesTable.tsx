"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MoreHorizontal,
  PanelRightOpen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteModal } from "@/components/shared/DeleteAlert";
import { OverlayProcess } from "@/components/shared/OverlayProcess";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { useSessionData } from "@/hooks/auth/useSessionData";
import { useToastPromise } from "@/hooks/shared/useToastPromise";
import {
  useDeleteOptionType,
  useReorderOptionTypes,
} from "../hooks/useOptionTypeMutations";
import { useModalsOptionType } from "../hooks/useModals";
import { OptionTypeFormDialog } from "./OptionTypeFormDialog";
import { OptionValuesPanel } from "./OptionValuesPanel";
import type { OptionTypeRow, InputType } from "../types";
import { DebouncedInput } from "@/components/shared/DebouncedInput";
import { useMediaQuery } from "usehooks-ts";
import { useGetOptionTypes } from "../hooks/useGetOptionTypes";

export const BADGE_CONFIG: Record<
  InputType,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  text: { label: "Texto", variant: "secondary" },
  color: { label: "Color", variant: "default" },
  image: { label: "Imagen", variant: "outline" },
  number: { label: "Número", variant: "destructive" },
};

function DraggableRow({
  item,
  dragEnabled,
  onManageValues,
  onEdit,
  onDelete,
  isMobile,
}: {
  item: OptionTypeRow;
  dragEnabled: boolean;
  onManageValues: (t: OptionTypeRow) => void;
  onEdit: (t: OptionTypeRow) => void;
  onDelete: (t: OptionTypeRow) => void;
  isMobile: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !dragEnabled });

  const badge = BADGE_CONFIG[item.input_type] ?? {
    label: item.input_type,
    variant: "outline" as const,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={isDragging ? "relative z-50 shadow-lg" : ""}
    >
      {!isMobile && (
        <TableCell
          className="w-10 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </TableCell>
      )}
      <TableCell>
        <span className="font-medium">{item.name}</span>
      </TableCell>
      <TableCell>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </TableCell>
      <TableCell>
        <Switch checked={item.is_visual_default} disabled />
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {item.value_count}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onManageValues(item)}>
              <PanelRightOpen className="mr-2 h-4 w-4" />
              Gestionar valores
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function OptionTypesTable() {
  const { data: sessionData, isPending } = useSessionData();
  const storeId = sessionData?.store?.id ?? "";
  const { showPromise } = useToastPromise();
  const { modalState, openModal, closeModal } = useModalsOptionType();
  const { mutateAsync: removeType, isPending: isDeleting } =
    useDeleteOptionType();
  const { mutateAsync: reorderTypes, isPending: isReordering } =
    useReorderOptionTypes();
  const [panelType, setPanelType] = useState<OptionTypeRow | null>(null);
  const [selectedDelete, setSelectedDelete] = useState<OptionTypeRow | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [orderedIds, setOrderedIds] = useState<string[] | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data: serverData, isLoading } = useGetOptionTypes(storeId);

  const items = useMemo(() => {
    const source = serverData ?? [];
    if (!orderedIds || orderedIds.length !== source.length) return source;
    const map = new Map(source.map((i) => [i.id, i]));
    return orderedIds
      .map((id) => map.get(id))
      .filter((v): v is OptionTypeRow => !!v);
  }, [serverData, orderedIds]);

  useEffect(() => {
    if (!serverData) return;
    if (!orderedIds || orderedIds.length !== serverData.length) {
      setOrderedIds(null);
    }
  }, [serverData, orderedIds]);

  const hasSearch = search.trim().length > 0;
  const dragEnabled =
    !isMobile && !hasSearch && !isReordering && items.length > 1;

  const filteredItems = useMemo(() => {
    if (!hasSearch) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, search, hasSearch]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    const newOrderedIds = reordered.map((item) => item.id);
    setOrderedIds(newOrderedIds);

    reorderTypes(newOrderedIds).catch(() => setOrderedIds(null));
  }

  function handleDelete(optionType: OptionTypeRow) {
    const promise = removeType(optionType.id);
    showPromise({
      promise: promise.then(() => setSelectedDelete(null)),
      messages: {
        loading: "Eliminando atributo...",
        success: "Atributo eliminado",
        error: (err: Error) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  }

  if (isPending || !storeId) return <SkeletonTable />;

  return (
    <>
      {(isDeleting || isReordering) && <OverlayProcess />}

      <div className="flex flex-col gap-4 lg:flex-row mb-6 lg:justify-between lg:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold tracking-tight font-poppins md:text-2xl">
            Atributos de tienda
          </h1>
          <p className="text-sm text-muted-foreground font-inter lg:text-md">
            Define los tipos de atributos (tallas, colores, materiales...) y sus
            valores
          </p>
        </div>
        <Button onClick={() => openModal("create", null)}>
          <Plus className="mr-2 h-4 w-4" /> Agregar atributo
        </Button>
      </div>

      <div className="mb-4">
        <DebouncedInput
          placeholder="Buscar por nombre..."
          valueDefault={search}
          onChange={setSearch}
        />
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {hasSearch
            ? "No se encontraron atributos"
            : "No hay atributos creados"}
        </div>
      ) : (
        <div className="rounded-md border">
          {isMobile && filteredItems.length > 1 && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              El reordenamiento de atributos solo está disponible en
              computadoras.
            </div>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    {!isMobile && <TableHead className="w-10" />}
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Visual default</TableHead>
                    <TableHead>Valores</TableHead>
                    <TableHead className="w-20">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <DraggableRow
                      key={item.id}
                      item={item}
                      dragEnabled={dragEnabled}
                      isMobile={isMobile}
                      onManageValues={setPanelType}
                      onEdit={(type) => openModal("edit", type)}
                      onDelete={setSelectedDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <OptionTypeFormDialog modalState={modalState} onClose={closeModal} />
      <OptionValuesPanel
        optionType={panelType}
        onClose={() => setPanelType(null)}
      />

      {selectedDelete && (
        <DeleteModal
          title="Eliminar atributo"
          description={
            <>
              ¿Estás seguro de que deseas eliminar el atributo{" "}
              <strong>{selectedDelete.name}</strong>?
              {selectedDelete.value_count > 0 && (
                <span className="block mt-2 text-destructive">
                  Este atributo tiene {selectedDelete.value_count} valor(es)
                  asociado(s) que también se eliminarán.
                </span>
              )}
              Esta acción no se puede deshacer.
            </>
          }
          open={!!selectedDelete}
          onOpenChange={(open) => {
            if (!open) setSelectedDelete(null);
          }}
          onConfirm={() => handleDelete(selectedDelete)}
        />
      )}
    </>
  );
}
