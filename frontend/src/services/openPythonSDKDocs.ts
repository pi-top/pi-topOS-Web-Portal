import api from "./api";

export default async function openPythonSDKDocs() {
  await api.post(`/open-python-sdk-docs`, {});
}
