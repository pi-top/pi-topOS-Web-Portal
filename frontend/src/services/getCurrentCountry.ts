import api from "./api";

export default async function getCurrentCountry() {
  const { data } = await api.get<string>(`/current-wifi-country`);

  return data;
}
