import api from "./api";

export default async function stopRoverController() {
  await api.post(`/rover-controller-stop`, {});
}
