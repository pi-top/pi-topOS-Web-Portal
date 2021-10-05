import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function configureLanding() {
  await axios.post(
    `${apiBaseUrl}/configure-landing`,
    {}
  );
}
