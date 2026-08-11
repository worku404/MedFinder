import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { medicinesApi } from "../api";
import { cursorFromUrl } from "../../../lib/pagination";
import { MedicineCard } from "../components/MedicineCard";
import { StatusBanner } from "../../../components/StatusBanner";

export function CategoryDetailPage() {
  const { slug } = useParams();
  const [catState, setCatState] = useState({ status: "loading", category: null, error: null });
  const [medState, setMedState] = useState({ status: "loading", medicines: [], nextCursor: null, error: null });

  useEffect(() => {
    let cancelled = false;

    // Fetch category metadata
    setCatState({ status: "loading", category: null, error: null });
    medicinesApi
      .categoryRetrieve(slug)
      .then((data) => {
        if (!cancelled) setCatState({ status: "ready", category: data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setCatState({ status: "error", category: null, error: err.message });
      });

    // Fetch medicines in this category
    setMedState({ status: "loading", medicines: [], nextCursor: null, error: null });
    medicinesApi
      .list({ category__slug: slug })
      .then((data) => {
        if (!cancelled)
          setMedState({
            status: "ready",
            medicines: data.results,
            nextCursor: cursorFromUrl(data.next),
            error: null,
          });
      })
      .catch((err) => {
        if (!cancelled)
          setMedState({ status: "error", medicines: [], nextCursor: null, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const loadMore = async () => {
    const data = await medicinesApi.list({ category__slug: slug, cursor: medState.nextCursor });
    setMedState((s) => ({
      ...s,
      medicines: [...s.medicines, ...data.results],
      nextCursor: cursorFromUrl(data.next),
    }));
  };

  if (catState.status === "loading") return <p className="auth-fineprint">Loading category…</p>;
  if (catState.status === "error") {
    return (
      <div className="catalog-page">
        <StatusBanner tone="error">This category isn't available.</StatusBanner>
      </div>
    );
  }

  const { category } = catState;

  return (
    <div className="catalog-page">
      <Link className="catalog-back" to="/medicines/categories">
        ← Categories
      </Link>
      <header className="catalog-header">
        <div>
          <p className="catalog-header__eyebrow">Category</p>
          <h1 className="catalog-header__title">{category.name}</h1>
        </div>
        <Link className="catalog-header__link" to="/medicines">
          All medicines
        </Link>
      </header>

      {category.description && <p className="medicine-detail__description">{category.description}</p>}

      <h2 style={{ fontSize: "var(--text-lg)", margin: "var(--space-6) 0 var(--space-4)", fontFamily: "var(--font-display)" }}>
        Medicines in this category
      </h2>

      {medState.status === "loading" && <p className="auth-fineprint">Loading medicines…</p>}
      {medState.status === "error" && <StatusBanner tone="error">{medState.error}</StatusBanner>}
      {medState.status === "ready" && medState.medicines.length === 0 && (
        <p className="auth-fineprint">No medicines currently listed under this category.</p>
      )}

      {medState.status === "ready" && medState.medicines.length > 0 && (
        <div className="medicine-grid">
          {medState.medicines.map((medicine) => (
            <MedicineCard key={medicine.slug ?? medicine.id} medicine={medicine} />
          ))}
        </div>
      )}

      {medState.status === "ready" && medState.nextCursor && (
        <button className="btn btn--google load-more" type="button" onClick={loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
