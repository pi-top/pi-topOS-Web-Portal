import api from "./api";
import { SwitchNetworkData } from "../types/SwitchNetwork";

export default async function verifyDeviceNetwork() {
  const { data } = await api.get<SwitchNetworkData>(`/should-switch-networks`);

  return data;
}
