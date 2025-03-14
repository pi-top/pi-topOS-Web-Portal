import api from "./api";

export default async function isConnectedToNetwork(timeout?: number) {
  const { data } = await api.get<{ connected: boolean }>(`/is-connected`, {
    timeout: timeout || 10000,
  });

  return data;
}
