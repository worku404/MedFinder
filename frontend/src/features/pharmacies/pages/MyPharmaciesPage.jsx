import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cursorFromUrl, pharmaciesApi } from "../api";
import { PharmacistPortalHeader } from "../components/PharmacistPortalHeader";
import { StoreKpiSummary } from "../components/StoreKpiSummary";
import { StoreCard } from "../components/StoreCard";
import { StatusBanner } from "../../../components/StatusBanner";

export function MyPharmaciesPage() {
  const [state, setState] = useState({
    status: "loading",
    pharmacies: [],
    nextCursor: null,
    error: null,
  });

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
        if (!cancelled) {
          setState({
            status: "error",
            pharmacies: [],
            nextCursor: null,
            error: err.message,
          });
        }
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
    <div className="portal-page">
      <header className="portal-page__header">
        <p className="portal-page__eyebrow">Pharmacist Portal</p>
        <h1 className="portal-page__title">Your Pharmacies & Stores</h1>
        <p className="portal-page__subtitle">
          Manage your verified pharmacy profiles, stock inventory levels, and patient inquiries.
        </p>
      </header>

      {/* Sub-Navigation Tabs */}
      <PharmacistPortalHeader storeCount={state.pharmacies.length} />

      {/* Loading & Error States */}
      {state.status === "loading" && <p className="auth-fineprint">Loading your stores…</p>}
      {state.status === "error" && <StatusBanner tone="error">{state.error}</StatusBanner>}

      {/* High-Level Store Health KPIs */}
      {state.status === "ready" && state.pharmacies.length > 0 && (
        <StoreKpiSummary pharmacies={state.pharmacies} />
      )}

      {/* Empty State */}
      {state.status === "ready" && state.pharmacies.length === 0 && (
        <div className="portal-empty-card">
          <h2 className="portal-empty-card__title">No Pharmacies Associated</h2>
          <p className="portal-empty-card__text">
            You are not currently linked to any pharmacy branch. You can either register your own
            pharmacy as an owner or join an existing store with an invite code.
          </p>
          <div className="portal-empty-card__actions">
            <Link className="btn btn--primary" to="/pharmacies/mine/new">
              + Register a New Pharmacy (Owner)
            </Link>
            <Link className="btn btn--outline" to="/pharmacies/join">
              Join Existing Pharmacy (Staff)
            </Link>
          </div>
        </div>
      )}

      {/* Store Cards Grid */}
      {state.status === "ready" && state.pharmacies.length > 0 && (
        <div className="portal-store-grid">
          {state.pharmacies.map((pharmacy) => (
            <StoreCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
        </div>
      )}

      {/* Pagination Load More */}
      {state.status === "ready" && state.nextCursor && (
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button className="btn btn--outline load-more" type="button" onClick={loadMore}>
            Load More Stores
          </button>
        </div>
      )}
    </div>
  );
}
