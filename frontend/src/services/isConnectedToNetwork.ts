import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function isConnectedToNetwork(timeout?: number) {
  const { data } = await axios.get<{connected: boolean}>(
    `${apiBaseUrl}/is-connected`,
    { timeout: timeout || 10000 }
  );

  return data;
}
