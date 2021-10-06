import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getHubFirmwareUpdateIsDue() {
  const { data } = await axios.get<boolean>(
    `${apiBaseUrl}/hub-firmware-update-is-due`
  );

  return data;
}
