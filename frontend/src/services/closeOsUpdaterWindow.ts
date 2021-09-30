import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function closeOsUpdaterWindow() {
  await axios.post(
    `${apiBaseUrl}/close-os-updater-window`,
    {},
  );
}
