import { useEffect, useState } from "react";

export default function useSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket>(() => new WebSocket(url));

  useEffect(() => {
    return () => socket.close();
  }, [socket]);

  return [socket, () => setSocket(new WebSocket(url))] as const;
}
