import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";
import { Timezone } from '../types/Timezone';

export default async function getTimezones() {
  const { data } = await axios.get<Timezone[]>(
    `${apiBaseUrl}/list-timezones`
  );

  return data;
}
