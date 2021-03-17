import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function setLocale(locale_code: string) {
  await axios.post(`${apiBaseUrl}/set-locale`, {
    locale_code
  });
}
