import api from "./api";

export default async function enableFurtherLinkService() {
  await api.post(`/enable-further-link-service`, {});
}
