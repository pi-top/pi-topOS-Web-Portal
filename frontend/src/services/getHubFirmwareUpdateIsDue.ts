import api from "./api";

export default async function getHubFirmwareUpdateIsDue() {
  const { data } = await api.get<boolean>(`/hub-firmware-update-is-due`);

  return data;
}
