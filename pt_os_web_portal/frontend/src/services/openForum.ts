 import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function openForum() {
  await axios.post(
    `${apiBaseUrl}/open-forum`,
    {}
  );
}
