import api from "./api";

export default async function openUpdater() {
  await api.post(`/open-updater`, {});
}
