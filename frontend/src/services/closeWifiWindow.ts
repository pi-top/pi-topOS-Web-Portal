import api from "./api";

export default async function closeWifiWindow() {
  await api.post(`/close-wifi-window`, {});
}
