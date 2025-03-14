import api from "./api";

export default async function serverStatus(args: any) {
  const { timeout } = args;
  const { data } = await api.get<string>(`/status`, {
    timeout: timeout || 10000,
  });

  return data;
}
