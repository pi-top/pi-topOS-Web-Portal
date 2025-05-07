import api from "./api";

export default async function stopOnboardingAutostart() {
  await api.post(`/stop-onboarding-autostart`, {});
}
