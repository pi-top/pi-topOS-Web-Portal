import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function markEulaAgreed() {
  await axios.post(
    `${apiBaseUrl}/mark-eula-agreed`,
    {}
  );
}
