import api from "./api";

export default async function getFurtherUrl() {
  const { data } = await api.get<{ [s: string]: string }>(`/further-url`);

  return data;
}
