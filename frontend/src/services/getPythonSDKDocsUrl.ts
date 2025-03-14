import api from "./api";

export default async function getPythonSDKDocsUrl() {
  const { data } = await api.get<{ [s: string]: string }>(
    `/python-sdk-docs-url`,
  );

  return data;
}
