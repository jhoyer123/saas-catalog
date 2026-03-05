import { useGetBanner } from "@/hooks/banner/useGetBanner";
import { BannerPreview } from "./BannerPreview";

export const BannerUploadForm = () => {
  //get banners
  const { data } = useGetBanner();

  //state from preview
  return (
    <>
      <BannerPreview banners={data || []} />
    </>
  );
};
