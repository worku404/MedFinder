import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { pharmaciesApi } from "../../pharmacies/api";
import { cursorFromUrl } from "../../../lib/pagination";
import { inventoryApi } from "../api";
import { StatusBanner } from "../../../components/StatusBanner";

export function InventoryListPage() {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [state, setState] = useState({ status: "loading", entries: [], nextCursor: null, error: null });

  useEffect(() => {
    let cancelled = false;
    pharmaciesApi
      .mineRetrieve(pharmacyId)
      .then((data) => {
        if (!cancelled) setPharmacy(data);
      })
      .catch(() => {
        // Non-fatal — the list below still works without the pharmacy
        // name/status; the header just falls back to a generic label.
      });
    return () => {
      cancelled = true;
    };
  }, [pharmacyId]);

  const load = (params) => {
    setState((s) => ({ ...s, status: "loading" }));
    inventoryApi
      .list({ pharmacy: pharmacyId, ...params })
      .then((data) =>
        setState((s) => ({
          status: "ready",
          entries: params?.cursor ? [...s.entries, ...data.results] : data.results,
          nextCursor: cursorFromUrl(data.next),
          error: null,
        }))
      )
      .catch((err) => setState({ status: "error", entries: [], nextCursor: null, error: err.message }));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacyId]);

  const handleConfirm = async (id) => {
    const updated = await inventoryApi.confirm(id);
    setState((s) => ({ ...s, entries: s.entries.map((entry) => (entry.id === id ? updated : entry)) }));
  };

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm("Remove this stock entry? This can't be undone.")) return;
    await inventoryApi.destroy(id);
    setState((s) => ({ ...s, entries: s.entries.filter((entry) => entry.id !== id) }));
  };

  // Matches InventorySerializer.validate_pharmacy on the backend — stock
  // can't be created for a pharmacy that isn't verified yet, so "Add a
  // drug" is hidden rather than shown-then-rejected on submit.
  const canPublish = pharmacy?.status === "verified";

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">Pharmacist</p>
          <h1 className="settings-header__title">{pharmacy ? `${pharmacy.name} — stock` : "Stock"}</h1>
        </div>
        {canPublish && (
          <Link className="btn btn--primary pharmacy-list__add" to={`/pharmacies/mine/${pharmacyId}/inventory/new`}>
            Add a drug
          </Link>
        )}
      </header>

      {pharmacy && !canPublish && (
        <StatusBanner tone="info">
          Stock can't be published until an administrator verifies this pharmacy. You'll be able to add
          drugs as soon as it's approved.
        </StatusBanner>
      )}

      {state.status === "loading" && state.entries.length === 0 && (
        <p className="auth-fineprint">Loading stock…</p>
      )}
      {state.status === "error" && <StatusBanner tone="error">{state.error}</StatusBanner>}

      {state.status === "ready" && state.entries.length === 0 && (
        <div className="settings-card">
          <p>No stock listed yet.</p>
          {canPublish && (
            <Link className="btn btn--primary" to={`/pharmacies/mine/${pharmacyId}/inventory/new`}>
              Add your first drug
            </Link>
          )}
        </div>
      )}

      {state.entries.map((entry) => (
        <article key={entry.id} className="settings-card inventory-row">
          <div className="inventory-row__head">
            <div>
              <h2 className="settings-card__title">
                {entry.medicine.name}
                {entry.medicine.strength ? ` ${entry.medicine.strength}` : ""}
              </h2>
              <p className="inventory-row__meta">
                {entry.quantity_available} in stock · ETB {Number(entry.price).toFixed(2)}
              </p>
            </div>
            <span className={`inventory-row__freshness${entry.is_stale ? " inventory-row__freshness--stale" : ""}`}>
              {entry.is_stale ? "Not confirmed recently" : "Confirmed"}
            </span>
          </div>
          <div className="inventory-row__actions">
            <button className="btn btn--google" type="button" onClick={() => handleConfirm(entry.id)}>
              Confirm freshness
            </button>
            <button
              className="btn btn--google"
              type="button"
              onClick={() => navigate(`/pharmacies/mine/${pharmacyId}/inventory/${entry.id}/edit`)}
            >
              Edit
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => handleDelete(entry.id)}>
              Remove
            </button>
          </div>
        </article>
      ))}

      {state.status === "ready" && state.nextCursor && (
        <button className="btn btn--google load-more" type="button" onClick={() => load({ cursor: state.nextCursor })}>
          Load more
        </button>
      )}
    </div>
  );
}
