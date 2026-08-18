import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { chatApi } from "../api";
import { ChatPanel } from "../components/ChatPanel";
import "../chat.css";

export function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pharmacyId = searchParams.get("pharmacy_id") || searchParams.get("pharmacyId");
  const pharmacyName = searchParams.get("pharmacy") || "Pharmacy Consultation";
  const branch = searchParams.get("branch") || "";
  const email = searchParams.get("email") || "";

  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    if (!pharmacyId) return;

    chatApi
      .startConversation(pharmacyId)
      .then((data) => {
        if (data && data.id) {
          setConversationId(data.id);
        }
      })
      .catch((err) => {
        console.error("Failed to initialize conversation with pharmacy:", err);
      });
  }, [pharmacyId]);

  if (!pharmacyId) {
    return <Navigate to="/search" replace />;
  }

  const handleClose = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <main className="chat-page-container">
      <section className="chat-page-hero">
        <h1 className="chat-page-hero__title">
          Ask the pharmacy
          <span className="chat-page-hero__title-muted">before you travel</span>
        </h1>
        <p className="chat-page-hero__subtitle">
          Send your inquiry directly to the pharmacy team for real-time stock and price confirmation.
        </p>
      </section>

      <div className="chat-page-wrapper">
        <ChatPanel
          conversationId={conversationId}
          pharmacyName={pharmacyName}
          branch={branch}
          email={email}
          onClose={handleClose}
        />
      </div>
    </main>
  );
}
