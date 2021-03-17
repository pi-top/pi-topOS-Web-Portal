import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";
import { BuildInfo } from "../types/Build";

export default async function getBuildInfo() {
  const { data } = await axios.get<BuildInfo>(
    `${apiBaseUrl}/build-info`
  );

  return data;
}
