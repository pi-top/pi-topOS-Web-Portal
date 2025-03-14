import api from "./api";

export default async function openOsDownload() {
  await api.post(`/open-os-download`, {});
}
