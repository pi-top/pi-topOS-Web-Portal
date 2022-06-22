import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getVncWpaGuiUrl() {
  const { data } = await axios.get<{ [s: string]: string }>(
    `${apiBaseUrl}/vnc-wpa-gui-url`
  );

  return data;
}
