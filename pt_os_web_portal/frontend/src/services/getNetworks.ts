import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

import { Network } from "../types/Network";


export default async function getNetworks() {
  const { data } = await axios.get<Network[]>(
    `${apiBaseUrl}/wifi-ssids`
  );

  return data;
}
