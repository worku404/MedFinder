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
          <p className="settings-header__eyebrow">Pharmacist Portal</p>
          <h1 className="settings-header__title">Your pharmacies</h1>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link className="btn btn--google pharmacy-list__add" to="/pharmacies/join">
            Join with invite code
          </Link>
          <Link className="btn btn--primary pharmacy-list__add" to="/pharmacies/mine/new">
            + Register a pharmacy
          </Link>
        </div>
      </header>

      {state.status === "loading" && <p className="auth-fineprint">Loading your pharmacies…</p>}
      {state.status === "error" && <StatusBanner tone="error">{state.error}</StatusBanner>}

      {state.status === "ready" && state.pharmacies.length === 0 && (
        <div className="settings-card">
          <p>You are not currently associated with any pharmacy.</p>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Link className="btn btn--primary" to="/pharmacies/mine/new">
              Register your pharmacy (Owner)
            </Link>
            <Link className="btn btn--google" to="/pharmacies/join">
              Join existing pharmacy (Staff)
            </Link>
          </div>
        </div>
      )}

      {state.status === "ready" &&
        state.pharmacies.map((pharmacy) => (
          <article key={pharmacy.id} className="settings-card pharmacy-card">
            <div className="pharmacy-card__head">
              <div>
                <h2 className="settings-card__title">{pharmacy.name}</h2>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: pharmacy.is_owner ? "var(--color-primary, #38bdf8)" : "var(--color-ink-soft)",
                  }}
                >
                  {pharmacy.is_owner ? "👑 Store Owner" : "🧑‍⚕️ Staff Pharmacist"}
                </span>
              </div>
              <PharmacyStatusBanner
                status={pharmacy.status}
                rejectionReason={pharmacy.rejection_reason}
                onEditResubmit={() => navigate(`/pharmacies/mine/${pharmacy.id}/edit`)}
              />
            </div>
            <p className="pharmacy-card__address">{pharmacy.address || "No address on file."}</p>
            <div className="pharmacy-card__actions">
              {pharmacy.is_owner ? (
                <>
                  <Link className="btn btn--google" to={`/pharmacies/mine/${pharmacy.id}/edit`}>
                    Edit details
                  </Link>
                  <Link className="btn btn--google" to={`/pharmacies/mine/${pharmacy.id}/staff`}>
                    Manage staff & invites
                  </Link>
                </>
              ) : null}
              <Link className="btn btn--primary pharmacy-card__manage-stock" to={`/pharmacies/mine/${pharmacy.id}/inventory`}>
                Manage stock
              </Link>
              {pharmacy.is_owner && <ShareLinkButton pharmacyId={pharmacy.id} status={pharmacy.status} />}
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
