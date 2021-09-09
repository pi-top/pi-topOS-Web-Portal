import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function deprioritiseOpenboxSession() {
  await axios.post(
    `${apiBaseUrl}/deprioritise-openbox-session`,
    {}
  );
}
