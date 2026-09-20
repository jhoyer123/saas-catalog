import { useGetBanner } from "@/hooks/banner/useGetBanner";
import { BannerPreview } from "@/components/store/banners/BannerPreview";
import { Plan } from "@/types/plan.types";
import { LoadingSpinner } from "../../shared/LoadingSpinner";
import { ErrorDisplay } from "../../shared/ErrorDisplay";

export const BannerContainer = ({ plan }: { plan?: Plan }) => {
  //get banners
  const { data, isLoading, isError, refetch } = useGetBanner();

  if (isLoading) {
    return <LoadingSpinner label="Cargando banners..." />;
  }

  if (isError) {
    return (
      <ErrorDisplay
        title="No se pudieron cargar los banners"
        message="Verifica tu conexión e inténtalo nuevamente."
        onRetry={() => refetch()}
      />
    );
  }

  return <BannerPreview banners={data || []} plan={plan} />;
};
