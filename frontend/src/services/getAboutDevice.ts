import api from "./api";

export default async function getAboutDevice() {
  const { data } = await api.get<{ [s: string]: string }>(`/about-device`);

  return data;
}
