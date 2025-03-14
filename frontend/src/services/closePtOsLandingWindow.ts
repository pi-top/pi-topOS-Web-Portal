import api from "./api";

export default async function closePtOsLandingWindow() {
  await api.post(`/close-pt-os-landing-window`, {});
}
