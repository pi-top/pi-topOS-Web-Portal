import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getCurrentLocale() {
  const { data } = await axios.get<string>(
    `${apiBaseUrl}/current-locale`
  );

  return data;
}
