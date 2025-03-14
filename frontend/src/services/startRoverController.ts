import api from "./api";

export default async function startRoverController() {
  await api.post(`/rover-controller-start`, {});
}
