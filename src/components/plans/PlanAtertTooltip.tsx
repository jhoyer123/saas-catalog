// components/plan-expiring-banner.tsx
"use client";

import Link from "next/link";
import { checkIsPlanExpiringSoon } from "@/lib/helpers/validations";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { useState } from "react";

interface Props {
  store: {
    is_active: boolean | null;
    plan_expires_at: string | null;
  };
}

export function PlanExpiringBanner({ store }: Props) {
  const [open, setOpen] = useState(false);

  if (!checkIsPlanExpiringSoon(store)) return null;

  const daysLeft = Math.ceil(
    (new Date(store.plan_expires_at!).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 text-amber-700 cursor-pointer">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {daysLeft} {daysLeft === 1 ? "día" : "días"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="flex items-center gap-2 w-fit p-2.5 text-sm">
        <span>Tu plan vence pronto</span>
        <Link
          href="/dashboard/plans"
          onClick={() => setOpen(false)}
          className="underline underline-offset-4 hover:opacity-70 transition-opacity font-medium"
        >
          Renovar
        </Link>
      </PopoverContent>
    </Popover>
  );
}
