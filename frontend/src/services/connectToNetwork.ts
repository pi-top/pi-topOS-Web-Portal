import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

import { NetworkCredentials } from "../types/Network";


export default async function connectToNetwork(networkCredentials: NetworkCredentials, timeout?: number) {
  await axios.post(
    `${apiBaseUrl}/wifi-credentials`,
    networkCredentials,
    { timeout: timeout || 10000 }
  );
}
