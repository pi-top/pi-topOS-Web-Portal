import api from "./api";

export default async function getCurrentTimezone() {
  const { data } = await api.get<string>(`/current-timezone`);

  return data;
}
