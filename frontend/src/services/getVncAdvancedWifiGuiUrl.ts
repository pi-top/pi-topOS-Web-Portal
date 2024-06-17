import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getVncAdvancedWifiGuiUrl() {
  const { data } = await axios.get<{ [s: string]: string }>(
    `${apiBaseUrl}/vnc-wifi-advanced-connection-url`
  );

  return data;
}
