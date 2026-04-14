"use client";

import { useSessionData } from "@/hooks/auth/useSessionData";
import { Sparkles } from "lucide-react";
import { PlanExpiringBanner } from "./PlanAtertTooltip";

const planStyles: Record<
  string,
  { bg: string; text: string; border: string; icon: string }
> = {
  Básico: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-500",
    icon: "text-gray-400",
  },
  Estándar: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "text-amber-400",
  },
  Pro: {
    bg: "bg-gray-900",
    border: "border-gray-900",
    text: "text-white",
    icon: "text-white",
  },
};

export function PlanBadge() {
  const { data: PlanData } = useSessionData();

  if (!PlanData?.store) return null;

  const planName = PlanData?.plan?.name ?? "Básico";
  const style = planStyles[planName] ?? planStyles["Básico"];

  return (
    <div className="flex gap-5">
      <PlanExpiringBanner store={PlanData?.store} />
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${style.bg} ${style.border} ${style.text}`}
      >
        <Sparkles size={11} strokeWidth={2} className={style.icon} />
        Plan {planName}
      </div>
    </div>
  );
}
