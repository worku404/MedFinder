import { formatSize, formatTime } from "../lib/chat-mock";

function Ticks({ status }) {
  if (status === "sending") {
    return (
      <svg className="chat-bubble__tick" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Sending">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  if (status === "failed") {
    return (
      <svg className="chat-bubble__tick chat-bubble__tick--failed" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Failed to send">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  if (status === "read") {
    return (
      <svg className="chat-bubble__tick chat-bubble__tick--read" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Read">
        <path d="M18 6L7 17l-5-5" />
        <path d="M22 10l-7.5 7.5L13 16" />
      </svg>
    );
  }
  return (
    <svg className="chat-bubble__tick" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Sent">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function ChatMessageBubble({ message, onOpenImage }) {
  const isMine = Boolean(message.isMine ?? (message.author === "customer"));

  return (
    <div className={`chat-row ${isMine ? "chat-row--outbound" : "chat-row--inbound"}`}>
      {!isMine && <span aria-hidden="true" className="chat-rail" />}

      <div className={`chat-bubble ${isMine ? "chat-bubble--outbound" : "chat-bubble--inbound"}`}>
        {message.images && message.images.length > 0 && (
          <div className={`chat-bubble__images ${message.images.length > 1 ? "chat-bubble__images--grid" : ""}`}>
            {message.images.map((img) => (
              <div key={img.id} className="chat-bubble__image-item">
                <button
                  type="button"
                  onClick={() => onOpenImage(img.url, img.alt)}
                  className="chat-bubble__image-button"
                >
                  <img
                    src={img.url}
                    alt={img.alt || "Attached photo"}
                    loading="lazy"
                    className="chat-bubble__image"
                  />
                </button>
                <span className="chat-bubble__image-meta">
                  Photo · {formatSize(img.size)}
                </span>
              </div>
            ))}
          </div>
        )}

        {message.text && (
          <p className="chat-bubble__text">{message.text}</p>
        )}

        <div className="chat-bubble__footer">
          <time dateTime={message.at}>{formatTime(message.at)}</time>
          {isMine && <Ticks status={message.status} />}
        </div>
      </div>
    </div>
  );
}

export function TypingBubble({ name }) {
  return (
    <div className="chat-row chat-row--inbound">
      <span aria-hidden="true" className="chat-rail" />
      <div className="chat-bubble chat-bubble--inbound chat-bubble--typing">
        <span className="sr-only">{name} is typing</span>
        <span className="chat-typing-dots" aria-hidden="true">
          <span className="chat-typing-dot" style={{ animationDelay: "0ms" }} />
          <span className="chat-typing-dot" style={{ animationDelay: "200ms" }} />
          <span className="chat-typing-dot" style={{ animationDelay: "400ms" }} />
        </span>
      </div>
    </div>
  );
}
