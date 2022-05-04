 import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function openWifi() {
  await axios.post(
    `${apiBaseUrl}/open-wifi`,
    {}
  );
}
