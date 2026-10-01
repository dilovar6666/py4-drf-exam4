import { useCallback, useEffect, useRef, useState } from "react";
import { WS_URL } from "../api/axios";

export default function useAuthenticatedSocket(path, onMessage, enabled = true) {
  const [status, setStatus] = useState("idle");
  const socketRef = useRef(null);
  const handlerRef = useRef(onMessage);
  useEffect(() => { handlerRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!enabled || !path || !token) return undefined;
    let stopped = false;
    let reconnectTimer;
    function connect() {
      if (stopped) return;
      setStatus("connecting");
      const socket = new WebSocket(`${WS_URL}${path}?token=${encodeURIComponent(token)}`);
      socketRef.current = socket;
      socket.onopen = () => setStatus("open");
      socket.onmessage = (event) => {
        try { handlerRef.current?.(JSON.parse(event.data)); } catch { /* ignore malformed frames */ }
      };
      socket.onerror = () => setStatus("error");
      socket.onclose = (event) => {
        socketRef.current = null;
        if (!stopped && event.code !== 4401 && event.code !== 4403) {
          setStatus("reconnecting");
          reconnectTimer = window.setTimeout(connect, 1800);
        } else if (!stopped) setStatus("closed");
      };
    }
    connect();
    return () => {
      stopped = true;
      window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, [enabled, path]);

  const send = useCallback((payload) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return false;
    socketRef.current.send(JSON.stringify(payload));
    return true;
  }, []);
  return { send, status };
}
