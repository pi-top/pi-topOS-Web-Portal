import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

import { NetworkCredentials } from "../types/Network";


export default async function connectToNetwork(networkCredentials: NetworkCredentials) {
  await axios.post(`${apiBaseUrl}/wifi-credentials`, networkCredentials);
}
