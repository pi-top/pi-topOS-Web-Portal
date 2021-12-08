import axios from "axios";

export default async function hostStatus(hostIP: string) {
  const { data } = await axios.get<string>(
    `http://${hostIP}/status`,
    { timeout: 5000 }
  );

  return data;
}
