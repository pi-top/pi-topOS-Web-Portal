import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function configureTour() {
  await axios.post(
    `${apiBaseUrl}/configure-tour`,
    {}
  );
}
