import api from "./api";

import { WifiConnectionInfo } from "../types/WifiConnectionInfo";

export default async function wifiConnectionInformation(timeout?: number) {
  const { data } = await api.get<WifiConnectionInfo>(`/wifi-connection-info`, {
    timeout: timeout || 5000,
  });

  return data;
}
