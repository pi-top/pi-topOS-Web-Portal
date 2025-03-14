import api from "./api";

import { NetworkCredentials } from "../types/Network";

export default async function connectToNetwork(
  networkCredentials: NetworkCredentials,
  timeout?: number,
) {
  await api.post(`/wifi-credentials`, networkCredentials, {
    timeout: timeout || 10000,
  });
}
