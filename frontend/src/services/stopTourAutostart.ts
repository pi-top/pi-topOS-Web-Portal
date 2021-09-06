 import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function stopTourAutostart() {
  await axios.post(
    `${apiBaseUrl}/disable-tour`,
    {}
  );
}
