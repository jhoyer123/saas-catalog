import { useGetBanner } from "@/hooks/banner/useGetBanner";
import { BannerPreview } from "./BannerPreview";
import { Plan } from "@/types/plan.types";

export const BannerUploadForm = ({ plan }: { plan?: Plan }) => {
  //get banners
  const { data } = useGetBanner();

  //state from preview
  return (
    <>
      <BannerPreview banners={data || []} plan={plan} />
    </>
  );
};
