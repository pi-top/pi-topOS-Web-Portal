import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getCurrentTimezone() {
  const { data } = await axios.get<string>(
    `${apiBaseUrl}/current-timezone`
  );

  return data;
}
