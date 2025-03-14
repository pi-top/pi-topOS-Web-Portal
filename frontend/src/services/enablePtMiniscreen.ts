import api from "./api";

export default async function enablePtMiniscreen() {
  await api.post(`/enable-pt-miniscreen`, {});
}
