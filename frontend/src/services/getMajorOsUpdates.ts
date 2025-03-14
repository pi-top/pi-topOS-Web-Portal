import api from "./api";

import { OsVersionUpdate } from "../types/OsVersionUpdate";

export default async function getMajorOsUpdates() {
  const { data } = await api.get<OsVersionUpdate>(`/os-updates`, {});
  return data;
}
