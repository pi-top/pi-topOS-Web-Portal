import api from "./api";

import { Network } from "../types/Network";

export default async function getNetworks() {
  const { data } = await api.get<Network[]>(`/wifi-ssids`);

  return data;
}
