import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function closeWifiWindow() {
  await axios.post(
    `${apiBaseUrl}/close-wifi-window`,
    {},
  );
}
