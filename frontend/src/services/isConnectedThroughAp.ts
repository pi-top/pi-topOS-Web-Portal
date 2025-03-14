import api from "./api";

export default async function isConnectedThroughAp() {
  const { data } = await api.get<{ isUsingAp: boolean }>(
    `/is-connected-through-ap`,
  );

  return data.isUsingAp;
}
