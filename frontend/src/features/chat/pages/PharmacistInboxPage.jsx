import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBanner } from "../../../components/StatusBanner";
import { chatApi } from "../api";
import { ChatModal } from "../components/ChatModal";
import "../chat.css";

export function PharmacistInboxPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);

  const loadConversations = async () => {
    try {
      const data = await chatApi.listConversations();
      setConversations(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">
            <Link to="/pharmacies/mine" style={{ color: "inherit", textDecoration: "underline" }}>
              ← Your pharmacies
            </Link>
          </p>
          <h1 className="settings-header__title">Patient Messages & Inquiries</h1>
        </div>
      </header>

      {loading && <p className="auth-fineprint">Loading patient conversations…</p>}
      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      {!loading && conversations.length === 0 && (
        <section className="settings-card">
          <p className="auth-fineprint">No patient conversations yet. When patients inquire about medicine availability, their messages will appear here.</p>
        </section>
      )}

      {!loading && conversations.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {conversations.map((conv) => (
            <article
              key={conv.id}
              className="chat-inbox__card"
              onClick={() => setActiveConversation(conv)}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <strong style={{ fontSize: "1.05rem" }}>{conv.pharmacy_name}</strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
                    • Patient: {conv.patient_email || conv.patient_username || `Patient #${conv.patient}`}
                  </span>
                </div>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem", color: "var(--color-ink-soft)" }}>
                  {conv.last_message ? conv.last_message.content : "Conversation initiated"}
                </p>
              </div>

              <button
                type="button"
                className="btn btn--primary"
                style={{ width: "auto", padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}
              >
                Open Chat
              </button>
            </article>
          ))}
        </div>
      )}

      {activeConversation && (
        <ChatModal
          conversationId={activeConversation.id}
          pharmacyName={`${activeConversation.pharmacy_name} — ${activeConversation.patient_email || "Patient"}`}
          onClose={() => {
            setActiveConversation(null);
            loadConversations();
          }}
        />
      )}
    </div>
  );
}
