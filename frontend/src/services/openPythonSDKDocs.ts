 import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function openPythonSDKDocs() {
  await axios.post(
    `${apiBaseUrl}/open-python-sdk-docs`,
    {}
  );
}
