import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function stopOnboardingAutostart() {
  await axios.post(
    `${apiBaseUrl}/stop-onboarding-autostart`,
    {}
  );
}
