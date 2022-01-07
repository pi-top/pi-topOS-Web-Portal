import axios from "axios";
import { SwitchNetworkData } from "../types/SwitchNetwork";

import apiBaseUrl from "./apiBaseUrl";

export default async function verifyDeviceNetwork() {
  const { data } = await axios.get<SwitchNetworkData>(
    `${apiBaseUrl}/should-switch-networks`
  );

  return data;
}
