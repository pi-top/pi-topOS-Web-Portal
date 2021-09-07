import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function leaveMiniscreenAppBreadcrumb() {
  await axios.post(
    `${apiBaseUrl}/onboarding-miniscreen-app-breadcrumb`,
    {}
  );
}
