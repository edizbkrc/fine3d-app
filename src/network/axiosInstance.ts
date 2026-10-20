import axios from "axios";
import { parseJsonPreservingBigInts } from "@helpers/Common/entityId";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Axios'un varsayılan JSON.parse'ı sanal tur id'lerini yuvarlıyor (bkz. entityId.ts).
  transformResponse: [
    (data: unknown) => {
      if (typeof data !== "string" || data === "") return data;
      try {
        return parseJsonPreservingBigInts(data);
      } catch {
        return data;
      }
    },
  ],
});

export default axiosInstance;
