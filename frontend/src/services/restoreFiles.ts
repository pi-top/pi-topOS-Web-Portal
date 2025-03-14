import api from "./api";

export default async function restoreFiles() {
  await api.post(`/restore-files`, {});
}
