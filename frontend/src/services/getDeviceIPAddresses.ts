import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getDeviceIPAddresses() {
  const { data } = await axios.get<string[]>(
    `${apiBaseUrl}/device-ip-addresses`
  );

  return data;
}
