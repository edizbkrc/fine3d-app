

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAppDispatch } from "@redux/hooks";
import navigationService from "@/services/NavigationService";

export const useNavigationService = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    navigationService.initialize(router, searchParams, dispatch, pathname);
  }, [router, searchParams, dispatch, pathname]);

  return navigationService;
};

export default useNavigationService;
