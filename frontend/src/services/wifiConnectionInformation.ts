import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";
import { WifiConnectionInfo } from "../types/WifiConnectionInfo";

export default async function wifiConnectionInformation(timeout?: number) {
  const { data } = await axios.get<WifiConnectionInfo>(
    `${apiBaseUrl}/wifi-connection-info`,
    { timeout: timeout || 5000 }
  );

  return data;
}
