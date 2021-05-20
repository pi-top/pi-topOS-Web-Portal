import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getFurtherUrl() {
  const { data } = await axios.get<{ [s: string]: string }>(
    `${apiBaseUrl}/further-url`
  );

  return data;
}
