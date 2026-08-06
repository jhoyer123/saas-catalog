"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isValidHexColor,
  normalizeColorHex,
  normalizeColorHexes,
} from "../lib/helpers/formatters";

interface ColorItem {
  hex: string;
  name: string;
}

interface Props {
  colorHexes: string[];
  disabled?: boolean;
  error?: string;
  onChange: (nextHexes: string[], formattedValueName?: string) => void;
}

const MAX_COLORS = 5;

// Helper para capitalizar/normalizar el nombre del color (ej. " negro " -> "Negro")
function capitalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function buildPreviewStyle(colorHexes: string[]) {
  if (colorHexes.length === 0) {
    return { backgroundColor: "hsl(var(--muted))" };
  }

  if (colorHexes.length === 1) {
    return { backgroundColor: colorHexes[0] };
  }

  const segmentSize = 100 / colorHexes.length;
  const gradient = colorHexes
    .map((hex, index) => {
      const start = (segmentSize * index).toFixed(2);
      const end = (segmentSize * (index + 1)).toFixed(2);
      return `${hex} ${start}% ${end}%`;
    })
    .join(", ");

  return { backgroundImage: `conic-gradient(${gradient})` };
}

export function OptionValueColorField({
  colorHexes,
  disabled = false,
  error,
  onChange,
}: Props) {
  const [draftHex, setDraftHex] = useState("#000000");
  const [draftName, setDraftName] = useState("");
  const [colorItems, setColorItems] = useState<ColorItem[]>(() =>
    colorHexes.map((hex) => ({ hex, name: "" })),
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const previewStyle = useMemo(
    () => buildPreviewStyle(colorHexes),
    [colorHexes],
  );
  const canAddMore = colorHexes.length < MAX_COLORS;

  const notifyChange = (updatedItems: ColorItem[]) => {
    const nextHexes = normalizeColorHexes(updatedItems.map((item) => item.hex));

    // CORRECCIÓN AQUÍ:
    // Capitalizamos, filtramos que no sea string vacío y luego unimos con " / "
    const validNames = updatedItems
      .map((item) => capitalizeName(item.name))
      .filter((name) => name.length > 0);

    const formattedName = validNames.join(" / ");

    onChange(nextHexes, formattedName);
  };

  const addColor = () => {
    const normalizedHex = normalizeColorHex(draftHex);

    if (!isValidHexColor(normalizedHex)) {
      setLocalError("Ingresa un HEX válido.");
      return;
    }

    if (!draftName.trim()) {
      setLocalError("Ingresa el nombre del color (ej. Negro, Azul).");
      return;
    }

    if (!canAddMore) {
      setLocalError("Máximo 5 colores por combinación.");
      return;
    }

    const newItem: ColorItem = {
      hex: normalizedHex,
      name: capitalizeName(draftName),
    };

    const nextItems = [...colorItems, newItem];
    setColorItems(nextItems);
    notifyChange(nextItems);

    setDraftName("");
    setLocalError(null);
  };

  const removeColor = (indexToRemove: number) => {
    const nextItems = colorItems.filter((_, idx) => idx !== indexToRemove);
    setColorItems(nextItems);
    notifyChange(nextItems);
    setLocalError(null);
  };

  return (
    <div className="grid w-full gap-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Label>Colores</Label>
          <p className="text-xs text-muted-foreground">
            Agrega hasta 5 colores y asigna un nombre a cada uno.
          </p>
        </div>
        <Badge variant="secondary">
          {colorHexes.length}/{MAX_COLORS}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[auto_1fr_1fr_auto] md:items-end">
        <div className="grid gap-2">
          <Label
            htmlFor="color-picker"
            className="text-xs text-muted-foreground"
          >
            Selector
          </Label>
          <Input
            id="color-picker"
            type="color"
            value={draftHex}
            onChange={(event) => {
              setDraftHex(event.target.value.toUpperCase());
              setLocalError(null);
            }}
            disabled={disabled || !canAddMore}
            className="h-10 w-16 cursor-pointer p-1"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="color-hex" className="text-xs text-muted-foreground">
            HEX
          </Label>
          <Input
            id="color-hex"
            type="text"
            value={draftHex}
            onChange={(event) => {
              setDraftHex(event.target.value.toUpperCase());
              setLocalError(null);
            }}
            placeholder="#FF0000"
            disabled={disabled || !canAddMore}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="color-name" className="text-xs text-muted-foreground">
            Nombre del color
          </Label>
          <Input
            id="color-name"
            type="text"
            value={draftName}
            onChange={(event) => {
              setDraftName(event.target.value);
              setLocalError(null);
            }}
            placeholder="Ej: Negro, Azul..."
            disabled={disabled || !canAddMore}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColor();
              }
            }}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addColor}
          disabled={disabled || !canAddMore}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 py-2">
        <div
          className="size-16 rounded-full border border-border shadow-sm"
          style={previewStyle}
          aria-label="Vista previa de la combinación de colores"
        />
        <div className="space-y-1">
          <p className="text-xs font-medium text-center sm:text-left">
            Vista previa
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            División equitativa según los colores agregados.
          </p>
        </div>
      </div>

      {colorItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {colorItems.map((item, index) => (
            <button
              key={`${item.hex}-${index}`}
              type="button"
              onClick={() => removeColor(index)}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed"
            >
              <span
                className="size-3 rounded-full border"
                style={{ backgroundColor: item.hex }}
              />
              <span>{item.name ? `${item.name} (${item.hex})` : item.hex}</span>
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-center text-muted-foreground">
          Todavía no has agregado colores a esta combinación.
        </p>
      )}

      {(localError || error) && (
        <p className="text-xs text-center text-destructive font-medium">
          {localError ?? error}
        </p>
      )}
    </div>
  );
}
