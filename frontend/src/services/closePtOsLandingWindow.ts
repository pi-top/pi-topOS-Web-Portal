import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function closePtOsLandingWindow() {
  await axios.post(
    `${apiBaseUrl}/close-pt-os-landing-window`,
    {},
  );
}
