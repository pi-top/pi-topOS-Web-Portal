import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function isFileSystemExpanded() {
  const { data } = await axios.get<{expanded: boolean}>(
    `${apiBaseUrl}/is-fs-expanded`
  );

  return data;
}
