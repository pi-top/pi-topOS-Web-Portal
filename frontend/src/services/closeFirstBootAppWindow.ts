import api from "./api";

export default async function closeFirstBootAppWindow() {
  await api.post(`/close-first-boot-app-window`, {});
}
