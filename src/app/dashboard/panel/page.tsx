"use client";

import PanelPage from "@/components/panel/PanelPage";
import { useSessionData } from "@/hooks/auth/useSessionData";
import SkeletonPanel from "@/components/panel/SkeletonPanel";
import { useProductCount } from "@/hooks/validation/useProductCount";
import { useEffect, useState } from "react";

export default function DashboardPanelPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  //important data for validation
  const { data: sessionData, isPending } = useSessionData();
  const storeId = sessionData?.store?.id;

  const { data: count, isPending: isCountPending } = useProductCount(storeId);

  if (isPending || isCountPending) return <SkeletonPanel />;

  return (
    <PanelPage
      hasProducts={(count ?? 0) > 0}
      store={sessionData?.store ?? null}
    />
  );
}
