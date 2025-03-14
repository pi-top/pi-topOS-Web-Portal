import api from "./api";

export default async function getVncDesktopUrl() {
  const { data } = await api.get<{ [s: string]: string }>(`/vnc-desktop-url`);

  return data;
}
