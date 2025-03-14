import { AxiosRequestConfig } from "axios";

import api from "./api";

export default async function getRoverControllerStatus(
  options?: AxiosRequestConfig,
) {
  const { data } = await api.get<{ status: string }>(
    `/rover-controller-status`,
    options,
  );
  return data;
}
