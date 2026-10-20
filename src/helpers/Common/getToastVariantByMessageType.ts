import { MessageTypeEnum } from "@helpers/types/MessageTypeEnum";

export const getToastVariantByMessageType = (messageType: MessageTypeEnum) => {
  switch (messageType) {
    case MessageTypeEnum.Information:
      return "success";
    case MessageTypeEnum.Validation:
      return "error";
    case MessageTypeEnum.Unauthorized:
      return "error";
    case MessageTypeEnum.Forbidden:
      return "error";
    case MessageTypeEnum.Warning:
      return "warning";
    case MessageTypeEnum.Error:
      return "error";
    case MessageTypeEnum.Fatal:
      return "error";
    default:
      return "success";
  }
};
