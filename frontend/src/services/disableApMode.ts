import api from "./api";

export default async function disableApMode() {
  await api.post(`/disable-ap-mode`, {});
}
