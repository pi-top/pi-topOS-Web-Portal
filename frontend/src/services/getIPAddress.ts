import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getIPAddress() {
  const { data } = await axios.get<string>(
    `${apiBaseUrl}/client-ip`
  );

  return data;
}
