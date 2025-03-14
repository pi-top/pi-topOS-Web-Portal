import api from "./api";

export default async function restartWebPortalService() {
  await api.post(`/restart-web-portal-service`, {});
}
