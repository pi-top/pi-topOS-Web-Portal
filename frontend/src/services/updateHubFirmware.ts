import api from "./api";

export default async function updateHubFirmware() {
  await api.post(`/update-hub-firmware`, {});
}
