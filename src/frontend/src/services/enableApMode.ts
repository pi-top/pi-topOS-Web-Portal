import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function enableApMode() {
  await axios.post(
    `${apiBaseUrl}/enable-ap-mode`,
    {}
  );
}
