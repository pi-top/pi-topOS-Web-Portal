import api from "./api";

export default async function startVncAdvancedWifiGui() {
  await api.post(`/start-vnc-wifi-advanced-connection`, {});
}
