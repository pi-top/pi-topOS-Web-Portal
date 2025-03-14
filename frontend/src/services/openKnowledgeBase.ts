import api from "./api";

export default async function openKnowledgeBase() {
  await api.post(`/open-knowledge-base`, {});
}
