import api from "./api";

export default async function configureLanding() {
  await api.post(`/configure-landing`, {});
}
