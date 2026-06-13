"use client";

import { useEffect, useMemo, useState } from "react";
import L, { type LatLngExpression } from "leaflet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

type Coordinates = {
  lat: number;
  lng: number;
};

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  disabled?: boolean;
  onChange: (location: Coordinates) => void;
}

//const DEFAULT_CENTER: LatLngExpression = [-16.2902, -63.5887];
const DEFAULT_CENTER: LatLngExpression = [-16.5000, -68.1500];
const DEFAULT_ZOOM = 13;

const locationIcon = L.divIcon({
  className: "",
  html: `
    <div class="flex h-5 w-5 items-center justify-center">
      <div class="h-4 w-4 rounded-full border-4 border-white bg-red-500 shadow-md"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapClickHandler({
  disabled,
  onChange,
}: {
  disabled?: boolean;
  onChange: (location: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      if (disabled) return;
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

function MapCenter({ position }: { position: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, DEFAULT_ZOOM, { animate: true });
  }, [map, position]);

  return null;
}

export function BranchLocationPicker({
  latitude,
  longitude,
  address,
  disabled = false,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const selectedPosition = useMemo<Coordinates | null>(() => {
    if (latitude == null || longitude == null) {
      return null;
    }

    return { lat: latitude, lng: longitude };
  }, [latitude, longitude]);

  const [position, setPosition] = useState<Coordinates | null>(
    selectedPosition,
  );

  useEffect(() => {
    setPosition(selectedPosition);
  }, [selectedPosition]);

  const center: LatLngExpression = position
    ? [position.lat, position.lng]
    : DEFAULT_CENTER;

  const triggerLabel = position
    ? address?.trim() || "Ubicación actualizada"
    : "Seleccionar ubicación en el mapa";

  const triggerDetail = position
    ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
    : "Sin ubicación asignada";

  const dialogDescription = position
    ? "Ubicación seleccionada. Si quieres ajustarla, haz clic en otro punto del mapa."
    : "Haz clic en el mapa para fijar las coordenadas de la sucursal.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-auto min-h-14 w-full max-w-full min-w-0 justify-start border-dashed px-3 py-3 text-left font-normal sm:min-h-16",
            position ? "border-input" : "text-muted-foreground",
          )}
        >
          <MapPin className="h-4 w-4 shrink-0 text-red-500" />
          <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 whitespace-normal wrap-break-word">
            <span className="w-full whitespace-normal wrap-break-wordbreak-words text-sm leading-snug">
              {triggerLabel}
            </span>
            <span className="w-full whitespace-normal  wrap-break-words text-xs leading-snug text-muted-foreground">
              {triggerDetail}
            </span>
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] gap-0 overflow-hidden p-0 sm:w-[min(56rem,calc(100vw-2rem))] sm:max-w-4xl sm:rounded-xl">
        <DialogHeader className="px-4 pt-4 pb-3 text-left sm:px-6 sm:pt-6 sm:pb-4">
          <DialogTitle>Seleccionar ubicación</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="border-t bg-muted/20 px-3 py-3 sm:px-6 sm:py-4">
          <div className="overflow-hidden rounded-lg border bg-background">
            {position ? (
              <div className="flex items-center gap-2 border-b bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <Check className="h-4 w-4 shrink-0" />
                <span className="font-medium">Ubicación seleccionada</span>
                <span className="min-w-0 wrap-break-words">
                  {address?.trim() || "La sucursal ya tiene coordenadas guardadas."}
                </span>
              </div>
            ) : (
              <div className="border-b bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Aún no hay una ubicación asignada.
              </div>
            )}

            <MapContainer
              center={center}
              zoom={position ? DEFAULT_ZOOM : 5}
              scrollWheelZoom
              className="h-[62vh] min-h-80 w-full sm:h-[60vh] sm:min-h-105"
            >
              <MapCenter position={center} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {position && <Marker position={position} icon={locationIcon} />}
              <MapClickHandler
                disabled={disabled}
                onChange={(nextPosition) => {
                  setPosition(nextPosition);
                  onChange(nextPosition);
                  setOpen(false);
                }}
              />
            </MapContainer>

            <div className="border-t bg-background px-3 py-2 text-xs text-muted-foreground sm:px-4">
              {disabled
                ? "El formulario está deshabilitado temporalmente."
                : "Puedes mover la ubicación haciendo clic en otro punto del mapa."}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
