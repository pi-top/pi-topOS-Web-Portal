import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getAvailableSpace() {
  const { data } = await axios.get<string>(
    `${apiBaseUrl}/available-space`
  );
  try {
    const availableSpace = parseInt(data, 10);
    if (Number.isNaN(availableSpace)) {
      throw new Error();
    }
    return availableSpace;
  } catch (_) {
    return 0;
  };
}
