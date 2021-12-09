import axios from "axios";
import { OnSameNetworkData } from "../types/OnSameNetwork";

import apiBaseUrl from "./apiBaseUrl";

export default async function verifyDeviceNetwork() {
  const { data } = await axios.get<OnSameNetworkData>(
    `${apiBaseUrl}/on-same-network`
  );

  return data;
}
