"use client";

import { useState } from "react";
import { User, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSessionData } from "@/hooks/auth/useSessionData";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function UserPendingApproval() {
  const { refetch } = useSessionData();
  const [checking, setChecking] = useState(false);
  const [stillPending, setStillPending] = useState(false);

  const verify = async () => {
    setChecking(true);
    setStillPending(false);

    // mínimo 800ms para que el feedback se note aunque la respuesta sea instantánea
    const [result] = await Promise.all([refetch(), sleep(800)]);

    // si ya está activo, el DashboardGuard desmonta este card solo
    if (!result.data?.profile?.is_active) {
      setStillPending(true);
    }
    setChecking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md text-center shadow-lg border-border animate-in zoom-in-95 duration-300">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Lock className="h-8 w-8" strokeWidth={2.25} />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-bold">
              Acceso pendiente
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Tu cuenta ha sido creada, pero un administrador debe activarla
              antes de que puedas entrar al sistema.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-3.5 rounded-xl border border-border/50 bg-muted/50 p-4 text-left">
            <div className="rounded-lg border border-border/50 bg-background p-2 text-muted-foreground shadow-xs">
              <User className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                Revisión manual
              </p>
              <p className="text-xs text-muted-foreground">
                Normalmente las solicitudes se aprueban en menos de 24 horas.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={verify}
              disabled={checking}
              className="w-full gap-2"
              size="lg"
            >
              <RefreshCw
                className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
              />
              {checking ? "Verificando..." : "Verificar estado"}
            </Button>

            {/* Feedback si sigue pendiente */}
            <p
              className={`text-xs text-muted-foreground transition-opacity duration-300 ${
                stillPending && !checking ? "opacity-100" : "opacity-0"
              }`}
              aria-live="polite"
            >
              Tu cuenta sigue pendiente. Intenta de nuevo más tarde.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
