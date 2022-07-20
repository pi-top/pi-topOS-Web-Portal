import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getVncDesktopUrl() {
  const { data } = await axios.get<{ [s: string]: string }>(
    `${apiBaseUrl}/vnc-desktop-url`
  );

  return data;
}
