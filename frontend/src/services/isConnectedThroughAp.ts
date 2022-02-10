import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function isConnectedThroughAp() {
  const { data } = await axios.get<{isUsingAp: boolean}>(
    `${apiBaseUrl}/is-connected-through-ap`
  );

  return data.isUsingAp;
}
