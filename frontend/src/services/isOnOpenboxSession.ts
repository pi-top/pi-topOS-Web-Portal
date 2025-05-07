import api from "./api";

export default async function isOnOpenboxSession() {
  const response = await api.get(`/is-on-openbox-session`);
  return response.data.isOnOpenboxSession;
}
