"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@redux/hooks";
import LoadingComponent from "@components/LoadingComponent";

export default function GeneralLoading({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const generalLoading = useAppSelector(
    (state) => state.AppReducer.generalLoading
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      <LoadingComponent open={generalLoading} />
      {children}
    </>
  );
}
