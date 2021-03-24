import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function disableStartupNoise() {
  await axios.post(
    `${apiBaseUrl}/disable-startup-noise`,
    {}
  );
}
