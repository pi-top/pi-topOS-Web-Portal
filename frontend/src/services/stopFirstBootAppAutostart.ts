import api from "./api";

export default async function stopFirstBootAppAutostart() {
  await api.post(`/stop-first-boot-app-autostart`, {});
}
