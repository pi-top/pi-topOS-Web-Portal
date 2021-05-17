import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getPythonSDKDocsUrl() {
  const { data } = await axios.get<{ [s: string]: string }>(
    `${apiBaseUrl}/python-sdk-docs-url`
  );

  return data;
}
