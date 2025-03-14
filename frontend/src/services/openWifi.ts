import api from "./api";

export default async function openWifi() {
  await api.post(`/open-wifi`, {});
}
