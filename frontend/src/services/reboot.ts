import api from "./api";

export default async function reboot() {
  await api.post(`/reboot`, {});
}
