import api from "./api";

export default async function getCurrentLocale() {
  const { data } = await api.get<string>(`/current-locale`);

  return data;
}
