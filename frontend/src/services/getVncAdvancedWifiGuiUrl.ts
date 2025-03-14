import api from "./api";

export default async function getVncAdvancedWifiGuiUrl() {
  const { data } = await api.get<{ [s: string]: string }>(
    `/vnc-wifi-advanced-connection-url`,
  );

  return data;
}
