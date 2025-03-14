import api from "./api";

export default async function setRegistration(email: string) {
  await api.post(`/set-registration`, {
    email,
  });
}
