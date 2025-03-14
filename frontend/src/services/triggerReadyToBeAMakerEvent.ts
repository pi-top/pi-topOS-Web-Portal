import api from "./api";

export default async function triggerReadyToBeAMakerEvent() {
  await api.post(`/onboarding-miniscreen-ready-to-be-a-maker`, {});
}
