import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getLocales() {
  const { data } = await axios.get<{ [s: string]: string }>(
    `${apiBaseUrl}/list-wifi-countries`
  );

  return data;
}
