import { useEffect, useState } from "react";
import { PharmacistPortalHeader } from "../../pharmacies/components/PharmacistPortalHeader";
import { chatApi } from "../api";
import { ChatPanel } from "../components/ChatPanel";
import { formatTime } from "../lib/chat-mock";

export function PharmacistInboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadConversations = () => {
    setLoading(true);
    chatApi
      .listConversations()
      .then((data) => {
        setConversations(data || []);
        if (data && data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load patient inquiries");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const filteredConversations = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.pharmacy_name?.toLowerCase().includes(q) ||
      c.patient_email?.toLowerCase().includes(q) ||
      c.patient_username?.toLowerCase().includes(q) ||
      c.last_message?.content?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (id) => {
    setSelectedId(id);
    setSidebarOpen(false);
    // Optimistically mark unread_count as 0 in local state
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c))
    );
  };

  return (
    <div className="portal-page inbox-page">
      <header className="portal-page__header">
        <p className="portal-page__eyebrow">Pharmacist Portal</p>
        <h1 className="portal-page__title">Patient Inquiries</h1>
        <p className="portal-page__subtitle">
          Real-time patient chat inquiries across all your registered stores and branches.
        </p>
      </header>

      {/* Portal Tab Navigation */}
      <PharmacistPortalHeader />

      {/* Mobile Drawer Toggle Button */}
      <div className="inbox-mobile-bar">
        <button
          type="button"
          className="inbox-mobile-toggle-btn"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label="Toggle patient inquiries list"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>
            {selectedConversation
              ? `${selectedConversation.pharmacy_name}`
              : `Inquiries (${conversations.length})`}
          </span>
          {conversations.some((c) => c.unread_count > 0) && (
            <span className="inbox-mobile-unread-dot" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Main 2-Column Split Master/Detail Inbox */}
      <div className="inbox-layout">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="inbox-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Master List Sidebar */}
        <aside className={`inbox-sidebar ${sidebarOpen ? "inbox-sidebar--open" : ""}`}>
          <div className="inbox-sidebar__header">
            <h2 className="inbox-sidebar__title">All Inquiries ({conversations.length})</h2>
            <button
              type="button"
              className="inbox-sidebar__close-mobile"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close inquiries list"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="inbox-sidebar__search">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by patient or store…"
              className="inbox-sidebar__search-input"
            />
          </div>

          <div className="inbox-sidebar__list">
            {loading && <p className="inbox-sidebar__status">Loading inquiries…</p>}
            {error && <p className="inbox-sidebar__status inbox-sidebar__status--error">{error}</p>}

            {!loading && filteredConversations.length === 0 && (
              <div className="inbox-sidebar__empty">
                <p>No patient inquiries found.</p>
              </div>
            )}

            {filteredConversations.map((c) => {
              const isSelected = c.id === selectedId;
              const hasUnread = c.unread_count > 0;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c.id)}
                  className={`inbox-card ${isSelected ? "inbox-card--selected" : ""}`}
                >
                  <div className="inbox-card__header">
                    <span className="inbox-card__pharmacy">{c.pharmacy_name}</span>
                    {c.last_message?.sent_on && (
                      <time className="inbox-card__time">
                        {formatTime(c.last_message.sent_on)}
                      </time>
                    )}
                  </div>

                  <div className="inbox-card__patient">
                    {c.patient_email || c.patient_username || `Patient #${c.patient}`}
                  </div>

                  <div className="inbox-card__footer">
                    <p className="inbox-card__preview">
                      {c.last_message?.content || "Started conversation"}
                    </p>
                    {hasUnread && (
                      <span className="inbox-card__unread-badge">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Active Conversation */}
        <section className="inbox-main">
          {selectedConversation ? (
            <ChatPanel
              key={selectedConversation.id}
              conversationId={selectedConversation.id}
              pharmacyName={selectedConversation.pharmacy_name}
              email={selectedConversation.patient_email}
            />
          ) : (
            <div className="inbox-main__empty">
              <p>Select a patient inquiry from the list to start responding.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
