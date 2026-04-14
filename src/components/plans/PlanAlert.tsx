// components/plan-status-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { checkIsPlanExpiringSoon } from "@/lib/helpers/validations";
import Link from "next/link";

interface Props {
  store: {
    is_active: boolean | null;
    plan_expires_at: string | null;
  };
}

const STORAGE_KEY = "plan_expiring_dialog_seen";

function getTodayString() {
  return new Date().toISOString().slice(0, 10); // "2025-04-13"
}

export function PlanAlert({ store }: Props) {
  const [open, setOpen] = useState(false);
  const isExpiringSoon = checkIsPlanExpiringSoon(store);

  useEffect(() => {
    if (!isExpiringSoon) return;
    const seenOn = localStorage.getItem(STORAGE_KEY);
    if (seenOn !== getTodayString()) setOpen(true);
  }, [isExpiringSoon]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, getTodayString());
    setOpen(false);
  };

  if (!isExpiringSoon) return null;

  const daysLeft = Math.ceil(
    (new Date(store.plan_expires_at!).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <AlertDialogTitle>Tu plan vence pronto</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Te quedan{" "}
            <strong>
              {daysLeft} {daysLeft === 1 ? "día" : "días"}
            </strong>
            . Renovalo para no perder el acceso a tu tienda.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Ahora no</AlertDialogCancel>
          <AlertDialogAction asChild onClick={handleClose}>
            <Link href="/dashboard/plans">Renovar</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
