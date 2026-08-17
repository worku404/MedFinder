import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { chatApi } from "../api";
import { useChatSocket } from "../hooks/useChatSocket";
import { QUICK_REPLIES } from "../lib/chat-mock";
import { ChatMessageBubble, TypingBubble } from "./ChatMessageBubble";

export function ChatPanel({
  conversationId,
  pharmacyName = "Pharmacy Consultation",
  branch = "",
  email = "",
  onClose,
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Fetch message history if conversationId is provided
  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    chatApi
      .listMessages(conversationId)
      .then((data) => {
        if (!isMounted) return;
        const currentId = user ? (user.id || user.pk) : null;
        const mapped = (data || []).map((m) => ({
          id: m.id,
          text: m.content,
          at: m.sent_on,
          isMine: currentId ? m.user === currentId : false,
          senderName: m.sender_username || m.sender_email,
          status: "sent",
        }));
        setMessages(mapped);
        // Mark conversation as read
        if (data && data.length > 0) {
          const latestId = data[data.length - 1].id;
          chatApi.markRead(conversationId, latestId).catch(() => {});
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load conversation messages");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [conversationId, user]);

  // 2. Real-time WebSocket connection for active conversation
  const handleIncomingMessage = useCallback(
    (event) => {
      const currentId = user ? (user.id || user.pk) : null;
      const isMine = currentId ? event.sender_id === currentId : false;
      const incoming = {
        id: event.id || `ws-${Date.now()}`,
        text: event.message,
        at: event.sent_on || new Date().toISOString(),
        isMine,
        status: "sent",
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        return [...prev, incoming];
      });

      if (!isMine && conversationId) {
        chatApi.markRead(conversationId, event.id).catch(() => {});
      }
    },
    [user, conversationId]
  );

  const { connectionStatus, sendMessage: sendWsMessage } = useChatSocket(
    conversationId,
    handleIncomingMessage
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, typing]);

  const handleSend = useCallback(() => {
    const body = text.trim();
    if (!body || !conversationId) return;

    const sent = sendWsMessage(body);
    if (sent) {
      setText("");
    }
  }, [text, conversationId, sendWsMessage]);

  const canSend = useMemo(
    () => text.trim().length > 0 && !!conversationId && connectionStatus === "connected",
    [text, conversationId, connectionStatus]
  );

  return (
    <div className="chat-panel">
      {/* Header */}
      <header className="chat-panel__header">
        <div className="chat-panel__header-info">
          <h2 className="chat-panel__title">
            {pharmacyName}
            {branch ? <span className="chat-panel__branch"> · {branch}</span> : null}
            {email ? <span className="chat-panel__email">{email}</span> : null}
          </h2>
          <p className="chat-panel__status">
            <span
              className="chat-panel__status-dot"
              style={{
                background:
                  connectionStatus === "connected"
                    ? "var(--color-verified, #10b981)"
                    : "var(--color-ink-soft, #8ca39f)",
              }}
              aria-hidden="true"
            />
            {connectionStatus === "connected" ? "LIVE WEBSOCKET CONNECTED" : "CONNECTING..."}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="chat-panel__close-btn"
            aria-label="Close chat window"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Close
          </button>
        )}
      </header>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="chat-panel__messages">
        {loading && <p className="chat-panel__empty">Loading past messages…</p>}
        {error && <p className="chat-panel__empty" style={{ color: "var(--color-caution)" }}>{error}</p>}

        {!loading && messages.length === 0 && (
          <div className="chat-panel__empty-state">
            <div className="chat-panel__empty-icon" aria-hidden="true">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="chat-panel__empty-title">Consult directly with the pharmacist</p>
            <p className="chat-panel__empty-desc">
              Ask about current stock, verify dosage, or check pricing.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} />
        ))}

        {typing && <TypingBubble />}
      </div>

      {/* Quick Replies Carousel */}
      <div className="chat-quick-replies" role="region" aria-label="Suggested quick questions">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setText(q);
              inputRef.current?.focus();
            }}
            className="chat-quick-replies__pill"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Interactive Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="chat-panel__footer"
      >
        <div className="chat-input-row">
          <label htmlFor="chat-message-input" className="chat-sr-only">
            Type your question
          </label>
          <textarea
            id="chat-message-input"
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your question to the pharmacist…"
            className="chat-textarea"
          />

          <button
            type="submit"
            disabled={!canSend}
            className="chat-send-btn"
            aria-label="Send message"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Send
          </button>
        </div>

        <p className="chat-footer-hint">
          ENTER SENDS · SHIFT+ENTER NEW LINE
        </p>
      </form>
    </div>
  );
}
