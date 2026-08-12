import { useCallback, useEffect, useRef, useState } from "react";
import { tokenStore } from "../../../lib/apiClient";

export function useChatSocket(conversationId, onMessageReceived) {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (!conversationId) return;

    const token = tokenStore.getAccess();
    if (!token) {
      setConnectionStatus("unauthenticated");
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    // In dev Vite proxy forwards /ws to Daphne backend
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
        if (data.type === "chat_message" || data.id) {
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        }
      } catch (err) {
        console.error("Failed to parse chat message frame:", err);
      }
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
    };

    ws.onerror = (err) => {
      console.error("WebSocket connection error:", err);
      setConnectionStatus("error");
    };

    return () => {
      ws.close();
    };
  }, [conversationId]);

  const sendMessage = useCallback((content) => {
    if (!content || !content.trim()) return false;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: content.trim() }));
      return true;
    }
    return false;
  }, []);

  return { connectionStatus, sendMessage };
}
