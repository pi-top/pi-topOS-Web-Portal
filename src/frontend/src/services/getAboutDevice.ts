import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getAboutDevice() {
  const { data } = await axios.get<{ [s: string]: string }>(
    `${apiBaseUrl}/about-device`
  );

  return data;
}
