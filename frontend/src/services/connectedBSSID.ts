import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function connectedBSSID(timeout?: number) {
  const { data } = await axios.get<string>(
    `${apiBaseUrl}/current-wifi-bssid`,
    { timeout: timeout || 5000 }
  );

  return data;
}
