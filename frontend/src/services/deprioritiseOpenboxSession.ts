import api from "./api";

export default async function deprioritiseOpenboxSession() {
  await api.post(`/deprioritise-openbox-session`, {});
}
