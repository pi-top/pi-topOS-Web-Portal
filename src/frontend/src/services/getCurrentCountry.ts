import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getCurrentCountry() {
  const { data } = await axios.get<string>(
    `${apiBaseUrl}/current-wifi-country`
  );

  return data;
}
