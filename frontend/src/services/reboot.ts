import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function reboot() {
  await axios.post(
    `${apiBaseUrl}/reboot`,
    {}
  );
}
