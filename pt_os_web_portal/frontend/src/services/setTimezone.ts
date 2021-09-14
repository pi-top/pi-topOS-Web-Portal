import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function setTimezone(timezone: string) {
  await axios.post(`${apiBaseUrl}/set-timezone`, {
    timezone
  });
}
