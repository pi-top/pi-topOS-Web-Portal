import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";
import { OsVersionUpdate } from "../types/OsVersionUpdate";

export default async function getMajorOsUpdates() {
  const { data } = await axios.get<OsVersionUpdate>(
    `${apiBaseUrl}/os-updates`,
    {}
  );
  return data;
}
