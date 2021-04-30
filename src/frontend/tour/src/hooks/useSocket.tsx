import { useEffect, useRef } from "react";

export default function useSocket(url: string) {
  const socketRef = useRef<WebSocket>(new WebSocket(url));

  useEffect(() => {
    const socket = socketRef.current;
    return () => socket.close();
  }, []);

  return socketRef.current;
}
