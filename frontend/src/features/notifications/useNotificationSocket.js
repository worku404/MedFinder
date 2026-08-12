import { useEffect, useRef } from "react";
import { tokenStore } from "../../lib/apiClient";

export function useNotificationSocket(status, onNotification) {
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const token = tokenStore.getAccess();
    if (!token) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/notifications/?token=${encodeURIComponent(token)}`;

    let ws = null;
    let reconnectTimeout = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.title && onNotificationRef.current) {
            onNotificationRef.current(data);
          }
        } catch (err) {
          console.error("Failed to parse notification frame:", err);
        }
      };

      ws.onclose = () => {
        if (!isDisposed) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        if (ws) ws.close();
      };
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [status]);
}
