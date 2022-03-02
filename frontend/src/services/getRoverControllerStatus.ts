import axios, { AxiosRequestConfig } from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function getRoverControllerStatus(
  options?: AxiosRequestConfig
) {
  const { data } = await axios.get<{ status: string }>(
    `${apiBaseUrl}/rover-controller-status`,
    options
  );
  return data;
}
