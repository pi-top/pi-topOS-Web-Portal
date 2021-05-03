import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function closePtBrowser() {
  await axios.post(
    `${apiBaseUrl}/close-pt-browser`,
    {},
  );
}
