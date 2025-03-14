import api from "./api";

export default async function vncServiceStatus() {
  const { data } = await api.get<{ [s: string]: boolean }>(
    `/vnc-service-state`,
  );

  return data;
}
