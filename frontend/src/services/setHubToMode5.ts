import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function setHubToMode5() {
  await axios.post(
    `${apiBaseUrl}/set-hub-mode-5`,
    {}
  );
}
