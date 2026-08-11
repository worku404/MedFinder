import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { medicinesApi } from "../api";
import { cursorFromUrl } from "../../../lib/pagination";
import { MedicineCard } from "../components/MedicineCard";
import { StatusBanner } from "../../../components/StatusBanner";

export function MedicineListPage() {
  const [state, setState] = useState({ status: "loading", medicines: [], nextCursor: null, error: null });

  const fetchMedicines = (params) => {
    setState((s) => ({ ...s, status: "loading" }));
    medicinesApi
      .list(params)
      .then((data) =>
        setState({ status: "ready", medicines: data.results, nextCursor: cursorFromUrl(data.next), error: null })
      )
      .catch((err) => setState({ status: "error", medicines: [], nextCursor: null, error: err.message }));
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const loadMore = async () => {
    const data = await medicinesApi.list({ cursor: state.nextCursor });
    setState((s) => ({
      ...s,
      medicines: [...s.medicines, ...data.results],
      nextCursor: cursorFromUrl(data.next),
    }));
  };

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <div>
          <p className="catalog-header__eyebrow">Catalog</p>
          <h1 className="catalog-header__title">Medicines</h1>
        </div>
        <Link className="catalog-header__link" to="/medicines/categories">
          Browse categories
        </Link>
      </header>

      {state.status === "loading" && <p className="auth-fineprint">Loading medicines…</p>}
      {state.status === "error" && <StatusBanner tone="error">{state.error}</StatusBanner>}
      {state.status === "ready" && state.medicines.length === 0 && (
        <p className="auth-fineprint">No medicines available in catalog.</p>
      )}

      {state.status === "ready" && state.medicines.length > 0 && (
        <div className="medicine-grid">
          {state.medicines.map((medicine) => (
            <MedicineCard key={medicine.slug ?? medicine.id} medicine={medicine} />
          ))}
        </div>
      )}

      {state.status === "ready" && state.nextCursor && (
        <button className="btn btn--google load-more" type="button" onClick={loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
