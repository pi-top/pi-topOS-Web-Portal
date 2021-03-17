import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function enableDeviceRegistrationService() {
  await axios.post(
    `${apiBaseUrl}/enable-device-registration-service`,
    {}
  );
}
