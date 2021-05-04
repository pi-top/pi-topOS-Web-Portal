import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function expandFileSystem() {
  await axios.post(
    `${apiBaseUrl}/expand-fs`,
    {}
  );
}
