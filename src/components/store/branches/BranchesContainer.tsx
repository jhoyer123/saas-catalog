import { LoadingSpinner } from "../../shared/LoadingSpinner";
import { ErrorDisplay } from "../../shared/ErrorDisplay";
import { useGetBranches } from "@/hooks/settings/useGetBranches";
import { FormBranches } from "./FormBranches";
import { useHandleActionsSettings } from "@/hooks/settings/useHandleActionsSetting";

export const BranchesContainer = () => {
  //get banners
  const { data, isLoading, isError, refetch } = useGetBranches();

  const { isPending: isSettingsPending, saveBranches } =
    useHandleActionsSettings();

  if (isLoading) {
    return <LoadingSpinner label="Cargando sucursales..." />;
  }

  if (isError) {
    return (
      <ErrorDisplay
        title="No se pudieron cargar las sucursales"
        message="Verifica tu conexión e inténtalo nuevamente."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <FormBranches
      defaultValues={{ branches: data || [] }}
      onSubmit={(data) => saveBranches(data.branches)}
      isPending={isSettingsPending}
    />
  );
};
