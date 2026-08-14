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
  const [drafts, setDrafts] = useState([]);
  const [typing, setTyping] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const fileRef = useRef(null);
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
        // Prevent duplicate appending if message already exists
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

  useEffect(() => {
    return () => {
      drafts.forEach((d) => URL.revokeObjectURL(d.url));
    };
  }, [drafts]);

  const addFiles = useCallback((files) => {
    if (!files || files.length === 0) return;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 4)
      .map((file) => ({
        file,
        url: URL.createObjectURL(file),
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      }));
    setDrafts((prev) => [...prev, ...picked].slice(0, 4));
  }, []);

  const handleSend = useCallback(() => {
    const body = text.trim();
    if (!body && drafts.length === 0) return;

    if (conversationId && body) {
      const sent = sendWsMessage(body);
      if (sent) {
        setText("");
        setDrafts([]);
        return;
      }
    }

    // Fallback send simulation if no active websocket/conversationId
    const images = drafts.map((d) => ({
      id: d.id,
      url: d.url,
      alt: `Photo sent by you: ${d.file.name}`,
      width: 768,
      height: 576,
      size: d.file.size,
    }));

    const messageId = `m-${Date.now()}`;
    const outgoing = {
      id: messageId,
      isMine: true,
      author: "customer",
      at: new Date().toISOString(),
      status: "sent",
      ...(body ? { text: body } : {}),
      ...(images.length > 0 ? { images } : {}),
    };

    setMessages((prev) => [...prev, outgoing]);
    setText("");
    setDrafts([]);
  }, [text, drafts, conversationId, sendWsMessage]);

  const canSend = useMemo(
    () => text.trim().length > 0 || drafts.length > 0,
    [text, drafts]
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
            {conversationId
              ? connectionStatus === "connected"
                ? "LIVE WEBSOCKET CONNECTED"
                : "CONNECTING..."
              : "DIRECT PHARMACY CHANNEL"}
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

      {/* Message Stream */}
      <div ref={scrollRef} className="chat-panel__body" aria-live="polite">
        {loading && <p className="chat-panel__watermark">Loading messages…</p>}
        {error && <p className="chat-panel__watermark" style={{ color: "var(--color-caution)" }}>{error}</p>}

        {!loading && messages.length === 0 && (
          <div className="chat-empty-state">
            <svg
              className="chat-empty-state__icon"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="chat-empty-state__title">Consult directly with the pharmacist</p>
            <p className="chat-empty-state__subtitle">
              Ask about current stock, verify dosage, or attach a photo of your prescription.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <ChatMessageBubble
            key={m.id}
            message={m}
            onOpenImage={(url, alt) => setLightbox({ url, alt })}
          />
        ))}

        {typing && <TypingBubble name={pharmacyName} />}
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
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="chat-panel__footer"
      >
        {/* Draft Image Preview Staging */}
        {drafts.length > 0 && (
          <ul className="chat-drafts-list">
            {drafts.map((d) => (
              <li key={d.id} className="chat-draft-item">
                <img
                  src={d.url}
                  alt={`Attached ${d.file.name}`}
                  className="chat-draft-item__thumb"
                />
                <button
                  type="button"
                  onClick={() => setDrafts((list) => list.filter((x) => x.id !== d.id))}
                  aria-label={`Remove ${d.file.name}`}
                  className="chat-draft-item__remove"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="chat-input-row">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="chat-sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach a photo of the prescription or medicine box"
            className="chat-attach-btn"
            title="Attach a photo"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>

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
            placeholder="Type your question, or attach a photo…"
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
          ENTER SENDS · SHIFT+ENTER NEW LINE · JPG/PNG UP TO 4 PHOTOS
        </p>
      </form>

      {/* Lightbox Full-Screen Photo Modal */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          onClick={() => setLightbox(null)}
          className="chat-lightbox-backdrop"
        >
          <img
            src={lightbox.url}
            alt={lightbox.alt || "Photo preview"}
            className="chat-lightbox-img"
          />
        </div>
      )}
    </div>
  );
}
