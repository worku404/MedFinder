import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { chatApi } from "../api";
import { useChatSocket } from "../hooks/useChatSocket";
import "../chat.css";

export function ChatModal({ conversationId, pharmacyName, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  // 1. Load message history on mount
  useEffect(() => {
    let cancelled = false;
    chatApi
      .listMessages(conversationId)
      .then((data) => {
        if (!cancelled) {
          setMessages(data);
          setLoadingHistory(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load message history:", err);
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // 2. Real-time WebSocket connection
  const handleIncomingMessage = (newMsg) => {
    setMessages((prev) => {
      // Deduplicate if already present
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });

    // Mark as read
    if (newMsg.id) {
      chatApi.markRead(conversationId, newMsg.id).catch(() => {});
    }
  };

  const { connectionStatus, sendMessage } = useChatSocket(conversationId, handleIncomingMessage);

  // 3. Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const sent = sendMessage(inputText);
    if (sent) {
      setInputText("");
    }
  };

  return (
    <div className="chat-modal__backdrop" onClick={onClose}>
      <div className="chat-modal__card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chat-modal__header">
          <div>
            <h2 className="chat-modal__title">{pharmacyName || "Pharmacy Chat"}</h2>
            <p className="chat-modal__subtitle">
              <span
                className={`chat-modal__status chat-modal__status--${
                  connectionStatus === "connected"
                    ? "connected"
                    : connectionStatus === "connecting"
                    ? "connecting"
                    : "disconnected"
                }`}
              />
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                ? "Connecting…"
                : "Offline"}
            </p>
          </div>
          <button
            type="button"
            className="btn btn--google"
            style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
            onClick={onClose}
          >
            ✕ Close
          </button>
        </div>

        {/* Messages Stream */}
        <div className="chat-modal__messages">
          {loadingHistory && <p className="auth-fineprint">Loading past messages…</p>}

          {!loadingHistory && messages.length === 0 && (
            <p className="auth-fineprint" style={{ textAlign: "center", margin: "auto" }}>
              No messages yet. Ask a question about medicine availability, price, or dosage.
            </p>
          )}

          {messages.map((msg) => {
            const isMe = msg.user === user?.id || msg.sender_id === user?.id;
            return (
              <div
                key={msg.id || `${msg.sent_on}-${msg.content}`}
                className={`chat-bubble ${isMe ? "chat-bubble--outbound" : "chat-bubble--inbound"}`}
              >
                <div>{msg.content || msg.message}</div>
                <div className="chat-bubble__meta">
                  {msg.sent_on
                    ? new Date(msg.sent_on).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Just now"}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form className="chat-modal__form" onSubmit={handleSend}>
          <input
            className="chat-modal__input"
            placeholder="Type your question…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={connectionStatus !== "connected"}
          />
          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: "auto", padding: "0.6rem 1.2rem" }}
            disabled={!inputText.trim() || connectionStatus !== "connected"}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
