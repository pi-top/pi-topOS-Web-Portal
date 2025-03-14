import api from "./api";

export default async function stopLandingAutostart() {
  await api.post(`/disable-landing`, {});
}
