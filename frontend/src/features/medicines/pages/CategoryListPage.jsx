import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cursorFromUrl } from "../../../lib/pagination";
import { medicinesApi } from "../api";
import { CategoryCard } from "../components/CategoryCard";
import { StatusBanner } from "../../../components/StatusBanner";

export function CategoryListPage() {
  const [state, setState] = useState({ status: "loading", categories: [], nextCursor: null, error: null });

  useEffect(() => {
    let cancelled = false;
    medicinesApi
      .categoriesList()
      .then((data) => {
        if (!cancelled)
          setState({ status: "ready", categories: data.results, nextCursor: cursorFromUrl(data.next), error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", categories: [], nextCursor: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = async () => {
    const data = await medicinesApi.categoriesList({ cursor: state.nextCursor });
    setState((s) => ({
      ...s,
      categories: [...s.categories, ...data.results],
      nextCursor: cursorFromUrl(data.next),
    }));
  };

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <div>
          <p className="catalog-header__eyebrow">Catalog</p>
          <h1 className="catalog-header__title">Categories</h1>
        </div>
        <Link className="catalog-header__link" to="/medicines">
          All medicines
        </Link>
      </header>

      {state.status === "loading" && <p className="auth-fineprint">Loading categories…</p>}
      {state.status === "error" && <StatusBanner tone="error">{state.error}</StatusBanner>}

      {state.status === "ready" && (
        <div className="category-grid">
          {state.categories.map((category) => (
            <CategoryCard key={category.slug ?? category.id} category={category} />
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
