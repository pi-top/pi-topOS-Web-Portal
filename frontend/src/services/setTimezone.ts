import api from "./api";

export default async function setTimezone(timezone: string) {
  await api.post(`/set-timezone`, {
    timezone,
  });
}
