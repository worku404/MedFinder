import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { StatusBanner } from "../../../components/StatusBanner";
import { chatApi } from "../../chat/api";
import { ChatModal } from "../../chat/components/ChatModal";
import { pharmaciesApi } from "../api";
import { PharmacyMap } from "../components/PharmacyMap";

export function PublicPharmacyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState({ status: "loading", pharmacy: null, error: null });
  const [activeConversation, setActiveConversation] = useState(null);
  const [startingChat, setStartingChat] = useState(false);
  const [chatError, setChatError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    pharmaciesApi
      .retrieve(id)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", pharmacy: data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", pharmacy: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleStartChat = async () => {
    if (!user) {
      navigate(`/login?next=/pharmacies/${id}`);
      return;
    }
    setStartingChat(true);
    setChatError(null);
    try {
      const conv = await chatApi.startConversation(id);
      setActiveConversation(conv);
    } catch (err) {
      setChatError(err.message || "Could not start chat with this pharmacy.");
    } finally {
      setStartingChat(false);
    }
  };

  if (state.status === "loading") return <p className="auth-fineprint">Loading pharmacy…</p>;
  if (state.status === "error") {
    return (
      <div className="settings-page">
        <StatusBanner tone="error">This pharmacy isn't available.</StatusBanner>
      </div>
    );
  }

  const { pharmacy } = state;

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">Pharmacy</p>
          <h1 className="settings-header__title">{pharmacy.name}</h1>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          style={{ width: "auto" }}
          onClick={handleStartChat}
          disabled={startingChat}
        >
          {startingChat ? "Opening chat…" : "Chat with Pharmacist"}
        </button>
      </header>

      {chatError && <StatusBanner tone="error">{chatError}</StatusBanner>}

      <section className="settings-card">
        <p>{pharmacy.address}</p>
        {pharmacy.phone_number && <p className="auth-fineprint">{pharmacy.phone_number}</p>}
        <PharmacyMap latitude={pharmacy.latitude} longitude={pharmacy.longitude} readOnly />
      </section>

      {activeConversation && (
        <ChatModal
          conversationId={activeConversation.id}
          pharmacyName={pharmacy.name}
          onClose={() => setActiveConversation(null)}
        />
      )}
    </div>
  );
}

