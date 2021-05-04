import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function setCountry(wifi_country: string) {
  await axios.post(`${apiBaseUrl}/set-wifi-country`, {
    wifi_country
  });
}
