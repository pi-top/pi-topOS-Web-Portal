import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function updateMimeDatabase() {
  await axios.post(
    `${apiBaseUrl}/update-mime-database`,
    {}
  );
}
