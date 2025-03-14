import api from "./api";

export default async function openForum() {
  await api.post(`/open-forum`, {});
}
