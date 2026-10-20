import { enqueueSnackbar } from "notistack";
import { getToastVariantByMessageType } from "../Common/getToastVariantByMessageType";
import { getCommonErrorMessage } from "./getCommonErrorMessage";

export default function showOpsApiMessages(data: any) {
  const messages = data?.messages || data?.Messages;
  if (messages) {
    messages?.forEach((message: any) => {
      const variant = getToastVariantByMessageType(
        message?.type || message?.Type
      );
      enqueueSnackbar?.(message.message, { variant });
    });
  } else {
    enqueueSnackbar(getCommonErrorMessage(), {
      variant: "error",
      autoHideDuration: 4000,
    });
  }
}
