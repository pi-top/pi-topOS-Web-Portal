import api from "./api";

export default async function closeOsUpdaterWindow() {
  await api.post(`/close-os-updater-window`, {});
}
