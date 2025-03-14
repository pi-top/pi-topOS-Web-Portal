import api from "./api";
import { BuildInfo } from "../types/Build";

export default async function getBuildInfo() {
  const { data } = await api.get<BuildInfo>("/build-info");
  return data;
}
