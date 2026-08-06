import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Texto opcional para mostrar debajo del spinner */
  label?: string;
}

export function LoadingSpinner({
  className,
  label,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
        className,
      )}
      role="status"
      aria-label="Cargando"
      {...props}
    >
      {/* Usamos Loader2 de lucide-react, el estándar en shadcn */}
      <Loader2 className="h-8 w-8 animate-spin text-primary" />

      {/* Texto opcional con colores de shadcn */}
      {label && (
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          {label}
        </p>
      )}

      <span className="sr-only">Cargando...</span>
    </div>
  );
}
