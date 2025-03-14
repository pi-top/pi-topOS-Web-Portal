import api from "./api";

export default async function openFurther() {
  await api.post(`/open-further`, {});
}
