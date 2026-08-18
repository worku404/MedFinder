import { useEffect, useRef, useState } from "react";
import { tokenStore } from "../../../lib/apiClient";

export function useChatSocket(conversationId, onMessageReceived) {
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const onMessageRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (!conversationId) {
      setConnectionStatus("disconnected");
      return;
    }

    const token = tokenStore.getAccess();
    if (!token) {
      setConnectionStatus("disconnected");
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/chat/${conversationId}/?token=${encodeURIComponent(token)}`;

    setConnectionStatus("connecting");
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat_message" || data.message) {
          onMessageRef.current?.(data);
        }
      } catch (err) {
        console.error("Failed to parse incoming WebSocket message:", err);
      }
    };

    ws.onerror = () => {
      setConnectionStatus("disconnected");
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = (messageText) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: messageText }));
      return true;
    }
    return false;
  };

  return { connectionStatus, sendMessage };
}
