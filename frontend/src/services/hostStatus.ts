import axios from "axios";

export default async function hostStatus(hostIP: string) {
  const { data } = await axios.get<string>(
    `http://${hostIP}/client-ip`,
    { timeout: 5000 }
  );

  return data;
}
