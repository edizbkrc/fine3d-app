import { useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { getConnectionErrorMessage } from "@helpers/Network/getConnectionErrorMessage";

export function useConnection() {
  useEffect(() => {
    const handleOnline = () => {

    };

    const handleOffline = () => {
      enqueueSnackbar(getConnectionErrorMessage(), {
        variant: "error",
        autoHideDuration: 4000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
}
