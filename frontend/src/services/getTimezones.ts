import api from "./api";

import { Timezone } from "../types/Timezone";

export default async function getTimezones() {
  const { data } = await api.get<Timezone[]>(`/list-timezones`);

  return data;
}
