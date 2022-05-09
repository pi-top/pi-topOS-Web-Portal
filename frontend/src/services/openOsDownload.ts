 import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function openOsDownload() {
  await axios.post(
    `${apiBaseUrl}/open-os-download`,
    {}
  );
}
