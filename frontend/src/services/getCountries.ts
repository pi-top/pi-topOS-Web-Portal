import api from "./api";

export default async function getLocales() {
  const { data } = await api.get<{ [s: string]: string }>(
    `/list-wifi-countries`,
  );

  return data;
}
