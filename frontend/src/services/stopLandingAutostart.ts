 import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function stopLandingAutostart() {
  await axios.post(
    `${apiBaseUrl}/disable-landing`,
    {}
  );
}
