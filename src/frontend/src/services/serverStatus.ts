import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function serverStatus(args: any) {
  const { timeout } = args;
  const { data } = await axios.get<string>(
    `${apiBaseUrl}/status`,
    { timeout: timeout || 10000 }
  );

  return data;
}
