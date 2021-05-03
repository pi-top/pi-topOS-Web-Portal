import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function disableTour() {
  await axios.post(
    `${apiBaseUrl}/disable-tour`,
    {}
  );
}
