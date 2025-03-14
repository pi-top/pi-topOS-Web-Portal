import api from "./api";

export default async function getAvailableSpace() {
  const { data } = await api.get<string>(`/available-space`);
  try {
    const availableSpace = parseInt(data, 10);
    if (Number.isNaN(availableSpace)) {
      throw new Error();
    }
    return availableSpace;
  } catch (_) {
    return 0;
  }
}
