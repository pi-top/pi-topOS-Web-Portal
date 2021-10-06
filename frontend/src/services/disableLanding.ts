import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function disableLanding() {
  await axios.post(
    `${apiBaseUrl}/disable-landing`,
    {}
  );
}
