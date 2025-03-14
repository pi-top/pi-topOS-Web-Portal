import api from "./api";

export default async function stopVncAdvancedWifiGui() {
  await api.post(`/stop-vnc-wifi-advanced-connection`, {});
}
