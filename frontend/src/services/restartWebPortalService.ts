 import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function restartWebPortalService() {
  await axios.post(
    `${apiBaseUrl}/restart-web-portal-service`,
    {}
  );
}
