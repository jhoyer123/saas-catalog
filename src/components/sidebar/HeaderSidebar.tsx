import { useSessionData } from "@/hooks/auth/useSessionData";
import Image from "next/image";
import HeaderSidebarSkeleton from "../dashboard/SkeletonHeaderSidebar";

const HeaderSidebar = () => {
  const { data: sessionData, isPending } = useSessionData();

  if (isPending) {
    return <HeaderSidebarSkeleton />;
  }

  return (
    <div className="w-full h-auto flex items-center justify-center pt-2 gap-2 pb-3 border-b">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center gap-3 w-full">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
          <Image
            src={sessionData?.store?.logo_url || "/images/logoDefault.webp"}
            alt="Logo"
            width={48}
            height={48}
            priority
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-lg font-poppins font-semibold text-gray-800 truncate">
          {sessionData?.store?.name || "Name Empresa"}
        </h1>
      </div>
    </div>
  );
};

export default HeaderSidebar;
