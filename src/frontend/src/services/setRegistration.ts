import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function setRegistration(email: string) {
  await axios.post(`${apiBaseUrl}/set-registration`, {
    email
  });
}
