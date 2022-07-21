import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function vncServiceStatus() {
  const { data } = await axios.get<{ [s: string]: boolean }>(
    `${apiBaseUrl}/vnc-service-status`
  );

  return data;
}
