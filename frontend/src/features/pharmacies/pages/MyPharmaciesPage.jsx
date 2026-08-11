import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cursorFromUrl, pharmaciesApi } from "../api";
import { PharmacyStatusBanner } from "../components/PharmacyStatusBanner";
import { ShareLinkButton } from "../components/ShareLinkButton";
import { StatusBanner } from "../../../components/StatusBanner";

export function MyPharmaciesPage() {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", pharmacies: [], nextCursor: null, error: null });

  useEffect(() => {
    let cancelled = false;
    pharmaciesApi
      .mineList()
      .then((data) => {
        if (cancelled) return;
        setState({
          status: "ready",
          pharmacies: data.results,
          nextCursor: cursorFromUrl(data.next),
          error: null,
        });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", pharmacies: [], nextCursor: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = async () => {
    const data = await pharmaciesApi.mineList({ cursor: state.nextCursor });
    setState((s) => ({
      ...s,
      pharmacies: [...s.pharmacies, ...data.results],
      nextCursor: cursorFromUrl(data.next),
    }));
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">Pharmacist</p>
          <h1 className="settings-header__title">Your pharmacies</h1>
        </div>
        <Link className="btn btn--primary pharmacy-list__add" to="/pharmacies/mine/new">
          Register a pharmacy
        </Link>
      </header>

      {state.status === "loading" && <p className="auth-fineprint">Loading your pharmacies…</p>}
      {state.status === "error" && <StatusBanner tone="error">{state.error}</StatusBanner>}

      {state.status === "ready" && state.pharmacies.length === 0 && (
        <div className="settings-card">
          <p>You haven't registered a pharmacy yet.</p>
          <Link className="btn btn--primary" to="/pharmacies/mine/new">
            Register your first pharmacy
          </Link>
        </div>
      )}

      {state.status === "ready" &&
        state.pharmacies.map((pharmacy) => (
          <article key={pharmacy.id} className="settings-card pharmacy-card">
            <div className="pharmacy-card__head">
              <h2 className="settings-card__title">{pharmacy.name}</h2>
              <PharmacyStatusBanner
                status={pharmacy.status}
                rejectionReason={pharmacy.rejection_reason}
                onEditResubmit={() => navigate(`/pharmacies/mine/${pharmacy.id}/edit`)}
              />
            </div>
            <p className="pharmacy-card__address">{pharmacy.address || "No address on file."}</p>
            <div className="pharmacy-card__actions">
              <Link className="btn btn--google" to={`/pharmacies/mine/${pharmacy.id}/edit`}>
                Edit details
              </Link>
              <ShareLinkButton pharmacyId={pharmacy.id} status={pharmacy.status} />
            </div>
          </article>
        ))}

      {state.status === "ready" && state.nextCursor && (
        <button className="btn btn--google load-more" type="button" onClick={loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
