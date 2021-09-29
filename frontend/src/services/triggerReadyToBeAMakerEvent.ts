import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function triggerReadyToBeAMakerEvent() {
  await axios.post(
    `${apiBaseUrl}/onboarding-miniscreen-ready-to-be-a-maker`,
    {}
  );
}
