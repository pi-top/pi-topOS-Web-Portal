 import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function openUpdater() {
  await axios.post(
    `${apiBaseUrl}/open-updater`,
    {}
  );
}
