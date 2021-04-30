import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function isConnectedToNetwork() {
  const { data } = await axios.get<{connected: boolean}>(
    `${apiBaseUrl}/is-connected`
  );

  return data;
}
