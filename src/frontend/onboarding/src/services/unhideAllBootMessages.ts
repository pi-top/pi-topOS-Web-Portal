import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function unhideAllBootMessages() {
  await axios.post(
    `${apiBaseUrl}/unhide-all-boot-messages`,
    {}
  );
}
