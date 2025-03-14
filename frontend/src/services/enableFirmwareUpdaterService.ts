import api from "./api";

export default async function enableFirmwareUpdaterService() {
  await api.post(`/enable-firmware-updater-service`, {});
}
