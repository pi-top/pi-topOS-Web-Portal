import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function closePtOsTourWindow() {
  await axios.post(
    `${apiBaseUrl}/close-pt-os-tour-window`,
    {},
  );
}
